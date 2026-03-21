/**
 * POST /api/webhooks/github
 *
 * Receives GitHub webhook events and persists them to the WebhookEvent table
 * for downstream processing.
 *
 * Security: the X-Hub-Signature-256 header is verified using HMAC-SHA256
 * with the GITHUB_WEBHOOK_SECRET environment variable before any payload
 * is processed.
 *
 * Configure this URL in GitHub:
 *   Repository / Organisation → Settings → Webhooks → Add webhook
 *   Payload URL: https://shipforge.dev/api/webhooks/github
 *   Content type: application/json
 *   Secret: <value of GITHUB_WEBHOOK_SECRET>
 *
 * Supported events: push, pull_request, ping (and any others — all persisted).
 */
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

async function verifyGitHubSignature(
  secret: string,
  rawBody: string,
  signatureHeader: string
): Promise<boolean> {
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf-8'), Buffer.from(signatureHeader, 'utf-8'));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const hdrs = await headers();
  const signature = hdrs.get('x-hub-signature-256');
  const eventType = hdrs.get('x-github-event') ?? 'unknown';

  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('GITHUB_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing X-Hub-Signature-256 header' }, { status: 400 });
  }

  const isValid = await verifyGitHubSignature(webhookSecret, rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // Handle ping event immediately
  if (eventType === 'ping') {
    return NextResponse.json({ received: true, event: 'ping' });
  }

  // Persist all other events for async processing
  try {
    await prisma.webhookEvent.create({
      data: {
        provider: 'GITHUB',
        eventType,
        payload: payload as object,
        status: 'RECEIVED',
      },
    });
  } catch (error) {
    console.error('Failed to persist GitHub webhook event:', error);
    return NextResponse.json({ error: 'Failed to record webhook event' }, { status: 500 });
  }

  return NextResponse.json({ received: true, event: eventType });
}
