'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Shield,
  CreditCard,
  Brain,
  Container,
  FolderOpen,
  Settings,
  Lock,
  Building,
  Github,
  Rocket,
  FileText,
  Clock,
  Upload,
  Mail,
  BarChart,
  Key,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StackCategory {
  label: string;
  options: string[];
}

interface WhyFeature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface GridFeature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface PricingTier {
  name: string;
  monthly: number;
  yearly: number;
  popular: boolean;
  features: string[];
  cta: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STACK_CATEGORIES: StackCategory[] = [
  { label: 'Frontend', options: ['React', 'Next.js', 'Vue'] },
  { label: 'Backend', options: ['Node/Express', 'Python/Django'] },
  { label: 'Database', options: ['PostgreSQL', 'MySQL'] },
  { label: 'ORM', options: ['Prisma', 'TypeORM'] },
  { label: 'Auth', options: ['NextAuth', 'Clerk'] },
  { label: 'Billing', options: ['Stripe'] },
  { label: 'AI', options: ['OpenAI'] },
  { label: 'Storage', options: ['AWS S3', 'Cloudinary'] },
  { label: 'Deployment', options: ['Vercel', 'Railway', 'Docker'] },
];

const WHY_FEATURES: WhyFeature[] = [
  {
    icon: <Zap className="w-6 h-6 text-cyan-400" />,
    title: 'Instant Stack Generation',
    desc: 'Go from zero to a production-ready project in minutes, not days.',
  },
  {
    icon: <Shield className="w-6 h-6 text-violet-400" />,
    title: 'Production Defaults',
    desc: 'Every config, env file, and Dockerfile is production-hardened from day one.',
  },
  {
    icon: <CreditCard className="w-6 h-6 text-cyan-400" />,
    title: 'Auth & Billing Wired In',
    desc: 'NextAuth, Clerk, and Stripe are configured and connected — not just mentioned.',
  },
  {
    icon: <Brain className="w-6 h-6 text-violet-400" />,
    title: 'AI-Ready Architecture',
    desc: 'OpenAI integration scaffolded with provider abstraction and guardrails built in.',
  },
  {
    icon: <Container className="w-6 h-6 text-cyan-400" />,
    title: 'Docker & CI/CD Ready',
    desc: 'Docker Compose and GitHub Actions workflows generated and ready to deploy.',
  },
  {
    icon: <FolderOpen className="w-6 h-6 text-violet-400" />,
    title: 'Multi-Project Workflow',
    desc: 'Manage multiple stacks with separate configs, templates, and environments.',
  },
  {
    icon: <Settings className="w-6 h-6 text-cyan-400" />,
    title: 'Environment Scaffolding',
    desc: 'Complete .env.example with documented variables for every integration.',
  },
];

const GRID_FEATURES: GridFeature[] = [
  { icon: <Lock className="w-5 h-5" />, title: 'Auth & Identity', desc: 'JWT, sessions, OAuth providers configured out of the box.' },
  { icon: <Building className="w-5 h-5" />, title: 'Organizations & Multi-tenant', desc: 'Org scoping, invite flows, and role isolation included.' },
  { icon: <CreditCard className="w-5 h-5" />, title: 'Billing & Trials', desc: 'Stripe subscriptions, free trials, and usage metering wired in.' },
  { icon: <Brain className="w-5 h-5" />, title: 'AI Orchestration', desc: 'OpenAI provider with streaming, retries, and token budgeting.' },
  { icon: <Github className="w-5 h-5" />, title: 'GitHub Sync', desc: 'Push generated stacks directly to a new or existing repository.' },
  { icon: <Settings className="w-5 h-5" />, title: 'Environment Management', desc: 'Typed .env schemas validated on startup via Zod.' },
  { icon: <Rocket className="w-5 h-5" />, title: 'Deployments', desc: 'One-click deploy configs for Vercel, Railway, and Docker.' },
  { icon: <FileText className="w-5 h-5" />, title: 'Docs Generator', desc: 'Auto-generated README and API docs from your stack selection.' },
  { icon: <Clock className="w-5 h-5" />, title: 'Queue & Cron Support', desc: 'Background jobs and scheduled tasks scaffolded with BullMQ.' },
  { icon: <Upload className="w-5 h-5" />, title: 'Storage & Uploads', desc: 'S3-compatible upload helpers with signed URLs and file validation.' },
  { icon: <Mail className="w-5 h-5" />, title: 'Emails & Notifications', desc: 'Transactional email templates wired to Resend or SendGrid.' },
  { icon: <BarChart className="w-5 h-5" />, title: 'Observability', desc: 'Structured logging, error tracking, and metrics endpoints included.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Admin Tools', desc: 'Protected admin routes with audit logging and impersonation support.' },
  { icon: <Key className="w-5 h-5" />, title: 'API Keys & Webhooks', desc: 'Scoped API key management and webhook verification helpers.' },
];

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    monthly: 0,
    yearly: 0,
    popular: false,
    cta: 'Get Started Free',
    features: [
      '5 stack generations/month',
      '2 templates',
      'ZIP downloads',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    monthly: 29,
    yearly: 23,
    popular: true,
    cta: 'Start Pro',
    features: [
      'Unlimited generations',
      '50 templates',
      'Private templates',
      'GitHub sync',
      'CI/CD files',
      'Docker bundle',
      'Priority support',
    ],
  },
  {
    name: 'Team',
    monthly: 79,
    yearly: 63,
    popular: false,
    cta: 'Start Team Trial',
    features: [
      'Everything in Pro',
      '5 team seats',
      'Shared templates',
      'Admin dashboard',
      'Billing modules',
      'Commercial license',
    ],
  },
];

const CREDIBILITY_BADGES = [
  { label: 'GitHub', symbol: '⬡' },
  { label: 'Stripe', symbol: 'S' },
  { label: 'OpenAI', symbol: '◎' },
  { label: 'Docker', symbol: '⬢' },
  { label: 'Prisma', symbol: '◈' },
  { label: 'Postgres', symbol: '🐘' },
];

const TERMINAL_LINES = [
  { color: 'text-gray-500', text: '# ShipForge · Generated stack output' },
  { color: 'text-cyan-400', text: '✔ Frontend   → Next.js 14 + TypeScript' },
  { color: 'text-cyan-400', text: '✔ Backend    → Node/Express REST API' },
  { color: 'text-cyan-400', text: '✔ Database   → PostgreSQL + Prisma ORM' },
  { color: 'text-violet-400', text: '✔ Auth       → NextAuth (Google + GitHub)' },
  { color: 'text-violet-400', text: '✔ Billing    → Stripe subscriptions + webhooks' },
  { color: 'text-violet-400', text: '✔ AI         → OpenAI streaming provider' },
  { color: 'text-green-400', text: '✔ Docker     → Compose + multi-stage builds' },
  { color: 'text-green-400', text: '✔ CI/CD      → GitHub Actions deploy pipeline' },
  { color: 'text-green-400', text: '✔ Storage    → AWS S3 + signed upload URLs' },
  { color: 'text-yellow-400', text: '' },
  { color: 'text-yellow-400', text: '📦 shipforge-stack.zip  (14 modules, 47 files)' },
  { color: 'text-gray-400', text: '⚡ Ready to deploy in < 5 minutes' },
];

const SECURITY_BULLETS = [
  'Environment validation on boot',
  'Webhook signature verification',
  'Rate limiting on auth endpoints',
  'Role-based access control',
  'Audit logging built in',
  'Stripe webhook idempotency',
];

// ─── Hero credibility badge ───────────────────────────────────────────────────

function CredibilityBadge({ label, symbol }: { label: string; symbol: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300 select-none">
      <span className="text-base leading-none">{symbol}</span>
      {label}
    </span>
  );
}

// ─── Stack Configurator ───────────────────────────────────────────────────────

function StackConfigurator() {
  const [selected, setSelected] = useState<Record<string, string>>({
    Frontend: 'Next.js',
    Backend: 'Node/Express',
    Database: 'PostgreSQL',
    ORM: 'Prisma',
    Auth: 'NextAuth',
    Billing: 'Stripe',
    AI: 'OpenAI',
    Storage: 'AWS S3',
    Deployment: 'Vercel',
  });

  function toggle(category: string, option: string) {
    setSelected((prev) => ({ ...prev, [category]: option }));
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 md:p-8 shadow-2xl">
      <div className="grid gap-5">
        {STACK_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              {cat.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.options.map((opt) => {
                const isActive = selected[cat.label] === opt;
                return (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggle(cat.label, opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-500/60 text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                    }`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Link href="/generator">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white border-0 px-8 font-semibold shadow-lg shadow-cyan-500/20"
          >
            Generate Stack
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────

function PricingCard({ tier, yearly }: { tier: PricingTier; yearly: boolean }) {
  const price = yearly ? tier.yearly : tier.monthly;

  return (
    <div
      className={`relative rounded-2xl border p-8 flex flex-col gap-6 transition-all duration-200 ${
        tier.popular
          ? 'border-cyan-500/60 bg-gradient-to-b from-cyan-950/40 to-[#0d1117] shadow-[0_0_40px_rgba(34,211,238,0.12)]'
          : 'border-white/10 bg-[#0d1117] hover:border-white/20'
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg">
          Most Popular
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-white">${price}</span>
          <span className="text-gray-400 pb-1">/mo</span>
        </div>
        {yearly && tier.monthly > 0 && (
          <p className="text-xs text-cyan-400 mt-1">
            Save ${(tier.monthly - tier.yearly) * 12}/year
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-2.5 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Link href={tier.monthly === 0 ? '/auth/signup' : '/auth/signup'} className="w-full">
        <Button
          className={`w-full font-semibold ${
            tier.popular
              ? 'bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 shadow-lg shadow-cyan-500/20'
              : 'bg-white/5 border border-white/15 text-white hover:bg-white/10'
          }`}
        >
          {tier.cta}
        </Button>
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [billingYearly, setBillingYearly] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white antialiased overflow-x-hidden">

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a1a]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            ⚡ ShipForge
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hidden sm:inline-flex">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 font-semibold shadow-md shadow-cyan-500/20"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] -translate-x-40" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Production-ready stacks in minutes
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
            Generate production&#8209;ready stacks.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Ship faster.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            ShipForge gives you a real foundation for modern products — auth, billing, database,
            AI, Docker, CI/CD, and GitHub workflows wired into one configurable stack.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/generator">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 text-base font-semibold px-8 h-12 shadow-xl shadow-cyan-500/25 w-full sm:w-auto"
              >
                Generate Your Stack
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-white/15 bg-white/5 hover:bg-white/10 text-base font-semibold px-8 h-12 w-full sm:w-auto"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Credibility row */}
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Integrates with</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CREDIBILITY_BADGES.map((b) => (
              <CredibilityBadge key={b.label} label={b.label} symbol={b.symbol} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Stack Configurator Preview ── */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 py-20" id="configurator">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Your Stack, Your Way</h2>
          <p className="text-gray-400 text-lg">Configure every layer before you generate.</p>
        </div>
        <StackConfigurator />
      </section>

      {/* ── Why ShipForge ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-20" id="features">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Why ShipForge</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Stop wiring boilerplate. Start shipping product.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_FEATURES.map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Card className="h-full border-white/10 bg-[#0d1117] hover:border-cyan-500/30 hover:shadow-[0_0_24px_rgba(34,211,238,0.08)] transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <CardTitle className="text-base text-white">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-sm leading-relaxed">
                    {f.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Everything Wired. Nothing Missing.
          </h2>
          <p className="text-gray-400 text-lg">
            14 production modules, pre-configured and ready to ship.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {GRID_FEATURES.map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-xl border border-white/8 bg-[#0d1117] p-5 hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-3 text-cyan-400 group-hover:text-violet-400 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 py-20" id="pricing">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 text-lg mb-8">No surprises. Cancel any time.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setBillingYearly(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !billingYearly ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingYearly(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingYearly ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start mt-4">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} yearly={billingYearly} />
          ))}
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Built for Production. Not Just Demo.
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { stat: '< 5 min', label: 'to first deploy' },
            { stat: '14+', label: 'modules included' },
            { stat: '100%', label: 'integrations wired' },
            { stat: 'Zero', label: 'boilerplate debt' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/10 bg-[#0d1117] p-5 text-center"
            >
              <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-1">
                {s.stat}
              </div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Terminal */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#0a0a12]">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-gray-600 font-mono">shipforge output</span>
            </div>
            <pre className="p-5 text-xs font-mono leading-6 overflow-x-auto">
              {TERMINAL_LINES.map((line, i) => (
                <div key={i} className={line.color}>
                  {line.text || '\u00A0'}
                </div>
              ))}
            </pre>
          </div>

          {/* Security bullets */}
          <div className="flex flex-col justify-center gap-4">
            <h3 className="text-lg font-bold text-white mb-2">Security & operational readiness</h3>
            {SECURITY_BULLETS.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-sm text-gray-300">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[100px]" />
          <div className="w-[400px] h-[200px] bg-cyan-500/8 rounded-full blur-[80px] translate-x-24" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Ready to ship your next product?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Generate your first stack in minutes. No credit card required.
          </p>
          <Link href="/generator">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 text-lg font-bold px-10 h-14 shadow-2xl shadow-cyan-500/30"
            >
              Generate Your Stack
            </Button>
          </Link>
          <div className="mt-5">
            <Link
              href="/pricing"
              className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
            >
              View Pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] mt-4">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-14">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="text-xl font-extrabold mb-3">⚡ ShipForge</div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                The fastest way to scaffold a production-ready, fully integrated modern stack.
                Auth, billing, AI, and CI/CD — all wired in.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Legacy Version', href: '/legacy' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-gray-500 hover:text-cyan-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-gray-500 hover:text-cyan-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/[0.06] text-center text-sm text-gray-600">
            © 2026 ShipForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
