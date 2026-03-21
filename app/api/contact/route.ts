import { NextResponse } from 'next/server';
import { sendEmail, contactConfirmationEmail, contactInternalEmail } from '@/lib/email';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000).trim(),
});

/**
 * POST /api/contact
 *
 * Required env vars (via lib/email.ts):
 *   RESEND_API_KEY or EMAIL_SERVER_HOST — see lib/email.ts for full docs
 *   CONTACT_EMAIL — address that receives inbound contact messages
 *                   (defaults to EMAIL_FROM or noreply@shipforge.dev)
 */
export async function POST(request: Request) {
  let body: z.infer<typeof schema>;

  try {
    const raw = await request.json();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    // Destination for inbound contact messages (your inbox)
    const emailFromEnv = process.env.EMAIL_FROM ?? '';
    // Extract bare address from "Name <email>" format, fall back to raw value
    const emailFromAddress = emailFromEnv.match(/<([^>]+)>/)?.[1] ?? emailFromEnv;
    const inboxAddress =
      process.env.CONTACT_EMAIL ||
      (emailFromAddress.includes('@') ? emailFromAddress : 'hello@shipforge.dev');

    // 1. Notify the owner with the full message details
    await sendEmail({
      to: inboxAddress,
      ...contactInternalEmail(body.name, body.email, body.message),
    });

    // 2. Send a confirmation to the user so they know it landed
    await sendEmail({
      to: body.email,
      ...contactConfirmationEmail(body.name, body.message),
    });
  } catch (error) {
    console.error('Contact email error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Message sent successfully.' });
}
