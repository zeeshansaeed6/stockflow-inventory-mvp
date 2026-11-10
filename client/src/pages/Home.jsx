/**
 * Public marketing / landing page.
 * Scroll-reveals via IntersectionObserver (see hooks/useReveal.js).
 */

import { Link } from 'react-router-dom';
import { Logo, IconBox, IconReports, IconHistory, IconTag, IconTruck, IconSettings, IconChevronRight } from '../components/icons/index.jsx';
import { useReveal } from '../hooks/useReveal';
import { useAuth } from '../context/AuthContext.jsx';

function Section({ children, className = '', id }) {
  const ref = useReveal();
  return (
    <section ref={ref} id={id} className={`reveal ${className}`}>
      {children}
    </section>
  );
}

function FeatureCard({ Icon, title, body, tint, delay = 0 }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal reveal-delay-${delay} card p-6 relative overflow-hidden group`}
    >
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition"
        style={{ backgroundColor: tint }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4"
        style={{ backgroundColor: tint }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="muted text-sm leading-relaxed">{body}</p>
    </div>
  );
}

const DEMO_BUSINESSES = [
  { name: 'Blue Spark Electronics', tag: 'Consumer tech', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop', color: '#3b82f6' },
  { name: 'Rooted Coffee Co',       tag: 'Café + roaster', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop', color: '#f59e0b' },
  { name: 'Bloom & Vine Florist',   tag: 'Floral shop',    img: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=400&fit=crop', color: '#ec4899' },
  { name: 'Trailhead Outfitters',   tag: 'Outdoor retail', img: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=600&h=400&fit=crop', color: '#10b981' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-hero-gradient dark:bg-hero-gradient-dark">
      {/* Top nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-9 h-9" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Stock<span className="text-brand-600">Flow</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700 dark:text-slate-200">
            <a href="#features" className="hover:text-brand-600">Features</a>
            <a href="#customers" className="hover:text-brand-600">Customers</a>
            <a href="#how" className="hover:text-brand-600">How it works</a>
            <a href="#cta" className="hover:text-brand-600">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app" className="btn-primary">Open app</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Sign in</Link>
                <Link to="/signup" className="btn-primary">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Small business inventory, done right
          </div>
          <RevealH1>
            Every box.<br />
            Every order.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-accent-violet to-accent-pink">
              Perfectly in flow.
            </span>
          </RevealH1>
          <RevealP>
            StockFlow is the fastest way to track products, suppliers and movements across your
            shop. Multi-tenant from day one, with dashboards that actually get used and a stock
            history that answers “where did this unit go?” in one click.
          </RevealP>
          <RevealCTA user={user} />
          <RevealStats />
        </div>

        <RevealArt />
      </section>

      {/* Logo ticker */}
      <Section className="pb-14">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-wider muted mb-4">
            Trusted by teams like yours
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-16 animate-marquee whitespace-nowrap items-center text-slate-500 dark:text-slate-400">
              {['North Bay Supply', 'Golden Hour Café', 'Petal Lane', 'Trail & Co', 'Bright Cables', 'Harbor Goods', 'Juniper Market', 'Sage Studio']
                .concat(['North Bay Supply', 'Golden Hour Café', 'Petal Lane', 'Trail & Co', 'Bright Cables', 'Harbor Goods', 'Juniper Market', 'Sage Studio'])
                .map((n, i) => (
                  <span key={i} className="text-lg font-semibold">{n}</span>
                ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              Everything you actually need
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              A full stockroom, in your browser.
            </h2>
            <p className="mt-3 muted">
              Skip the spreadsheets. StockFlow bundles the modules you'd otherwise glue together —
              with sensible defaults and a clean, visual interface.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard Icon={IconBox} tint="#3b82f6" delay={1} title="Products you can see" body="Photo-first catalog with categories, suppliers, cost/retail prices and low-stock thresholds — bulk-manageable." />
            <FeatureCard Icon={IconReports} tint="#ec4899" delay={2} title="Reports that read themselves" body="Inventory value, retail value, potential margin and top movers — right on the first screen." />
            <FeatureCard Icon={IconHistory} tint="#f59e0b" delay={3} title="A full stock history" body="Every +/- on every product, with who did it, when, and the note they left behind." />
            <FeatureCard Icon={IconTag} tint="#8b5cf6" delay={1} title="Colour-coded categories" body="Spot a product at a glance. Filter and search by category or supplier without leaving the list." />
            <FeatureCard Icon={IconTruck} tint="#10b981" delay={2} title="Suppliers in one place" body="Store contact names, emails, phones and notes. Link them to products for fast reorders." />
            <FeatureCard Icon={IconSettings} tint="#06b6d4" delay={3} title="Multi-tenant from day one" body="Each organization is isolated — bring your whole team without ever seeing another org's data." />
          </div>
        </div>
      </Section>

      {/* Customers */}
      <Section id="customers" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold text-accent-pink uppercase tracking-wider">
                Real examples
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                Four businesses, already set up.
              </h2>
            </div>
            <Link to="/login" className="text-sm font-medium text-brand-600 hover:underline inline-flex items-center gap-1">
              Try any demo account <IconChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEMO_BUSINESSES.map((b, i) => <BusinessCard key={b.name} biz={b} delay={(i % 4) + 1} />)}
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm font-semibold text-accent-violet uppercase tracking-wider text-center">
            Three steps
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100 text-center">
            From “where's that SKU?” to shipped.
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Sign up', body: 'One form. Email, password, organization name. You own the data; the demo accounts are isolated from yours.', color: '#3b82f6' },
              { n: '02', title: 'Add your catalog', body: 'Create categories, pull in suppliers, and add products with photos. A CSV import is in the roadmap.', color: '#f43f5e' },
              { n: '03', title: 'Watch it work', body: 'Dashboard flags low stock. Reports surface inventory value. Stock history keeps everyone honest.', color: '#10b981' },
            ].map((s, i) => <StepCard key={s.n} step={s} delay={i + 1} />)}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section id="cta" className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Ready when you are.
          </h2>
          <p className="mt-4 muted text-lg">
            Free while we build it. Sign up now or open a demo org.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/signup" className="btn-primary text-base px-6 py-3">
              Create your organization
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3">
              Try a demo account
            </Link>
          </div>
          <p className="mt-4 text-xs muted">
            Demo accounts: <code>owner@bluespark.demo</code>, <code>owner@rooted.demo</code>, <code>owner@bloom.demo</code>, <code>owner@trailhead.demo</code> — password <code>demo1234</code>
          </p>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white/60 dark:bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs muted">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <span>© {new Date().getFullYear()} StockFlow</span>
          </div>
          <div>Built as a practice MVP. Open source.</div>
        </div>
      </footer>
    </div>
  );
}

/* --- Reveal-wrapped bits -------------------------------------------------- */

function RevealH1({ children }) {
  const ref = useReveal();
  return (
    <h1
      ref={ref}
      className="reveal text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-[1.05]"
    >
      {children}
    </h1>
  );
}

function RevealP({ children }) {
  const ref = useReveal();
  return (
    <p ref={ref} className="reveal reveal-delay-1 mt-6 text-lg muted max-w-xl leading-relaxed">
      {children}
    </p>
  );
}

function RevealCTA({ user }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal reveal-delay-2 mt-8 flex flex-wrap items-center gap-3">
      {user ? (
        <Link to="/app" className="btn-primary text-base px-6 py-3">Open your dashboard</Link>
      ) : (
        <>
          <Link to="/signup" className="btn-primary text-base px-6 py-3">Start free</Link>
          <Link to="/login" className="btn-secondary text-base px-6 py-3">Try demo</Link>
        </>
      )}
    </div>
  );
}

function RevealStats() {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal reveal-delay-3 mt-10 grid grid-cols-3 gap-6 max-w-md">
      {[
        { n: '34', l: 'Products in demo' },
        { n: '9',  l: 'Demo accounts' },
        { n: '42', l: 'Movements seeded' },
      ].map((s) => (
        <div key={s.l}>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{s.n}</div>
          <div className="text-xs muted mt-1">{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function RevealArt() {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal relative">
      <div className="absolute -top-8 -left-8 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-6 w-80 h-80 bg-accent-pink/30 rounded-full blur-3xl" />
      <div className="relative card p-5 shadow-xl animate-float">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="ml-3 text-sm muted">StockFlow · Dashboard</span>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4">
          {[
            { label: 'Products',  value: '34',     color: 'from-brand-500 to-brand-400' },
            { label: 'On hand',   value: '712',    color: 'from-accent-pink to-accent-violet' },
            { label: 'Low stock', value: '9',      color: 'from-accent-amber to-accent-rose' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 text-white bg-gradient-to-br ${s.color}`}>
              <div className="text-xs opacity-80">{s.label}</div>
              <div className="text-2xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[
            { n: 'Blue T-Shirt (M)', v: 42, w: '72%' },
            { n: 'USB-C 65W Charger', v: 22, w: '55%' },
            { n: 'Leather Wallet',    v: 3,  w: '12%', low: true },
            { n: 'Ethiopia Yirgacheffe', v: 34, w: '65%' },
          ].map((r) => (
            <div key={r.n} className="flex items-center gap-3">
              <div className="w-40 truncate text-sm text-slate-700 dark:text-slate-200">{r.n}</div>
              <div className="flex-1 h-2 rounded bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-2 rounded ${r.low ? 'bg-red-500' : 'bg-brand-500'}`}
                  style={{ width: r.w }}
                />
              </div>
              <div className={`w-8 text-right text-sm font-semibold ${r.low ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
                {r.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BusinessCard({ biz, delay }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal reveal-delay-${delay} card overflow-hidden group`}>
      <div className="relative h-44 overflow-hidden">
        <img
          src={biz.img}
          alt={biz.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1"
          style={{ background: biz.color }}
        />
      </div>
      <div className="p-5">
        <div className="text-xs uppercase tracking-wider muted">{biz.tag}</div>
        <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{biz.name}</div>
      </div>
    </div>
  );
}

function StepCard({ step, delay }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal reveal-delay-${delay} card p-6 relative`}>
      <div
        className="text-6xl font-black opacity-10 absolute top-3 right-4 select-none"
        style={{ color: step.color }}
      >
        {step.n}
      </div>
      <div
        className="w-10 h-10 rounded-lg mb-4 inline-flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: step.color }}
      >
        {step.n}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
      <p className="mt-2 muted text-sm leading-relaxed">{step.body}</p>
    </div>
  );
}
