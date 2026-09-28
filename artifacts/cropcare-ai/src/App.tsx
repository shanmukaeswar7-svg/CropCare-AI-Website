import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, Bell, CalendarDays, Check, ChevronDown,
  CircleHelp, CloudSun, FileImage, Filter, FolderOpen, History as HistoryIcon, ImagePlus,
  Leaf, Menu, MoreHorizontal, Search, ShieldCheck, Sparkles, Sprout, Trash2,
  X, Zap,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';

const queryClient = new QueryClient();
const STORAGE_KEY = 'cropcare-diagnoses';

type Diagnosis = {
  id: string; crop: string; date: string; status: 'Healthy' | 'Needs attention' | 'Monitor';
  confidence: number; image?: string; finding: string; advice: string; area: string;
};

const starterDiagnoses: Diagnosis[] = [
  { id: 'cc-1047', crop: 'Tomato', date: '2025-06-12T08:42:00', status: 'Healthy', confidence: 92, finding: 'No visible signs of stress', advice: 'Keep your current watering rhythm and continue checking new growth weekly.', area: 'North field · Row 3' },
  { id: 'cc-1042', crop: 'Cucumber', date: '2025-06-10T16:18:00', status: 'Needs attention', confidence: 84, finding: 'Possible early powdery mildew', advice: 'Improve airflow around the plant and inspect nearby leaves over the next 48 hours.', area: 'Glasshouse · Bed B' },
  { id: 'cc-1038', crop: 'Pepper', date: '2025-06-08T07:05:00', status: 'Monitor', confidence: 76, finding: 'Light leaf edge discoloration', advice: 'Check soil moisture and look for a pattern across neighboring plants.', area: 'South field · Row 1' },
];

function readDiagnoses(): Diagnosis[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : starterDiagnoses;
  } catch { return starterDiagnoses; }
}

function saveDiagnoses(items: Diagnosis[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary><Shell /></RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Shell() {
  const [location] = useLocation();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(readDiagnoses);
  const [mobileNav, setMobileNav] = useState(false);
  const refresh = (next: Diagnosis[]) => { setDiagnoses(next); saveDiagnoses(next); };
  const pageTitle = location === '/' ? 'Overview' : location.includes('diagnose') ? 'New diagnosis' : location.includes('history') ? 'History' : location.includes('dashboard') ? 'Dashboard' : 'Screening result';

  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-2">
          <div className="leaf-mark relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
            <Sprout size={22} strokeWidth={2.2} className="relative z-10" />
          </div>
          <div><div className="font-serif text-[21px] font-semibold tracking-tight">CropCare</div><div className="font-mono text-[9px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.58)]">Field intelligence</div></div>
        </div>
        <div className="mt-12 px-2 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.45)]">Workspace</div>
        <nav className="mt-3 flex flex-col gap-1">
          <NavItem href="/" icon={<Leaf size={17} />} label="Overview" active={location === '/'} onNavigate={() => setMobileNav(false)} />
          <NavItem href="/diagnose" icon={<Sparkles size={17} />} label="Diagnose a plant" active={location.includes('/diagnose')} onNavigate={() => setMobileNav(false)} />
          <NavItem href="/history" icon={<HistoryIcon size={17} />} label="History" active={location.includes('/history')} count={diagnoses.length} onNavigate={() => setMobileNav(false)} />
          <NavItem href="/dashboard" icon={<BarChart3 size={17} />} label="Dashboard" active={location.includes('/dashboard')} onNavigate={() => setMobileNav(false)} />
        </nav>
        <div className="mt-auto rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary)/.16)] text-[hsl(var(--sidebar-primary))]"><ShieldCheck size={17} /></div>
          <p className="text-xs font-semibold">A calm second opinion</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[hsl(var(--sidebar-foreground)/.58)]">Screenings are a first pass, not a diagnosis. When in doubt, check with your agronomist.</p>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-[hsl(var(--sidebar-border))] pt-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary))] text-xs font-bold text-[hsl(var(--sidebar-primary-foreground))]">JM</div>
          <div className="min-w-0"><p className="truncate text-xs font-semibold">Jordan Miller</p><p className="truncate text-[10px] text-[hsl(var(--sidebar-foreground)/.5)]">Willow Creek Farm</p></div>
          <button type="button" data-testid="button-profile-menu" className="ml-auto text-[hsl(var(--sidebar-foreground)/.5)]" aria-label="Open profile menu"><MoreHorizontal size={17} /></button>
        </div>
      </aside>
      {mobileNav && <button aria-label="Close navigation" data-testid="button-close-navigation" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-[hsl(var(--foreground)/.28)] lg:hidden" />}
      <main className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-border bg-background/90 px-5 backdrop-blur-md sm:px-8">
          <button type="button" data-testid="button-open-navigation" aria-label="Open navigation" onClick={() => setMobileNav(true)} className="mr-4 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"><Menu size={20} /></button>
          <div className="flex-1"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Willow Creek Farm / 2025</p><h1 className="font-serif text-xl font-semibold tracking-tight text-foreground">{pageTitle}</h1></div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground sm:flex"><CloudSun size={15} className="text-[hsl(var(--accent))]" /> 18°C · Partly cloudy</div>
          <button type="button" data-testid="button-notifications" aria-label="Notifications" className="relative ml-3 rounded-full p-2 text-muted-foreground hover:bg-muted"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /></button>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-8 pb-24 sm:px-8 lg:px-12 lg:py-10">
          <Switch>
            <Route path="/" component={() => <Overview diagnoses={diagnoses} />} />
            <Route path="/diagnose" component={() => <Diagnose onSave={refresh} />} />
            <Route path="/history" component={() => <History diagnoses={diagnoses} onDelete={(id) => refresh(diagnoses.filter((item) => item.id !== id))} />} />
            <Route path="/dashboard" component={() => <Dashboard diagnoses={diagnoses} />} />
            <Route path="/result/:id" component={() => <Result diagnoses={diagnoses} />} />
            <Route component={() => <Overview diagnoses={diagnoses} />} />
          </Switch>
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        <MobileNavItem href="/" label="Home" icon={<Leaf size={18} />} active={location === '/'} />
        <MobileNavItem href="/diagnose" label="Diagnose" icon={<Sparkles size={18} />} active={location.includes('/diagnose')} />
        <MobileNavItem href="/history" label="History" icon={<HistoryIcon size={18} />} active={location.includes('/history')} />
        <MobileNavItem href="/dashboard" label="Insights" icon={<BarChart3 size={18} />} active={location.includes('/dashboard')} />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active, count, onNavigate }: { href: string; icon: ReactNode; label: string; active: boolean; count?: number; onNavigate: () => void }) {
  return <Link href={href} onClick={onNavigate} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-colors ${active ? 'bg-[hsl(var(--sidebar-primary)/.14)] text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground)/.64)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}>{icon}<span className="flex-1">{label}</span>{count !== undefined && <span className={`font-mono text-[10px] ${active ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground)/.4)]'}`}>{count}</span>}</Link>;
}

function MobileNavItem({ href, icon, label, active }: { href: string; icon: ReactNode; label: string; active: boolean }) {
  return <Link href={href} data-testid={`mobile-link-${label.toLowerCase()}`} className={`flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{icon}<span>{label}</span></Link>;
}

function Overview({ diagnoses }: { diagnoses: Diagnosis[] }) {
  const [location, setLocation] = useLocation();
  const recent = diagnoses.slice(0, 3);
  const healthy = diagnoses.filter((d) => d.status === 'Healthy').length;
  return <div className="animate-rise-in">
    <div className="relative overflow-hidden rounded-[26px] bg-[hsl(var(--primary))] px-6 py-8 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)] sm:px-10 sm:py-10">
      <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[38px] border-[hsl(var(--accent)/.12)]" /><div className="absolute -bottom-28 right-40 h-64 w-64 rounded-full border-[28px] border-[hsl(var(--accent)/.08)]" />
      <div className="relative max-w-2xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary-foreground)/.2)] bg-[hsl(var(--primary-foreground)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em]"><Zap size={12} className="text-[hsl(var(--accent))]" /> Your field companion</div><h2 className="max-w-xl font-serif text-4xl font-semibold leading-[1.04] tracking-[-.03em] sm:text-5xl">See what your plants are telling you.</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-[hsl(var(--primary-foreground)/.72)]">Take a clear photo of a leaf, stem, or fruit. Get a calm first read in under a minute — with practical next steps.</p><button type="button" data-testid="button-start-diagnosis" onClick={() => setLocation('/diagnose')} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-sm transition-transform hover:-translate-y-0.5">Start a screening <ArrowRight size={16} /></button></div>
      <div className="absolute bottom-8 right-10 hidden h-36 w-36 rotate-[-12deg] items-end justify-center sm:flex"><div className="h-28 w-12 rounded-[100%_0_100%_0] border-l-2 border-[hsl(var(--accent)/.8)] bg-[hsl(var(--accent)/.18)]" /><div className="absolute bottom-0 h-32 w-px bg-[hsl(var(--accent)/.6)]" /><div className="absolute bottom-12 right-4 h-9 w-16 rotate-[20deg] rounded-[100%_0_100%_0] bg-[hsl(var(--accent)/.32)]" /><div className="absolute bottom-20 left-5 h-7 w-14 rotate-[-28deg] rounded-[100%_0_100%_0] bg-[hsl(var(--accent)/.26)]" /></div>
    </div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><StatCard label="Screenings this season" value={String(diagnoses.length)} detail="Saved in your field log" icon={<FileImage size={18} />} /><StatCard label="Plants looking well" value={String(healthy)} detail="Based on recent screenings" icon={<ShieldCheck size={18} />} tone="amber" /><StatCard label="Needs a closer look" value={String(diagnoses.filter((d) => d.status !== 'Healthy').length)} detail="Worth checking in person" icon={<Activity size={18} />} tone="clay" /></div>
    <section className="mt-10"><div className="mb-4 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Field log</p><h3 className="mt-1 font-serif text-2xl font-semibold">Recent screenings</h3></div><Link href="/history" data-testid="link-view-all-screenings" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">View all <ArrowRight size={14} /></Link></div>{recent.length ? <div className="grid gap-3">{recent.map((item, index) => <DiagnosisRow key={item.id} item={item} index={index} />)}</div> : <EmptyState />}</section>
    <div className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_.8fr]"><div className="field-grid rounded-2xl border border-border bg-card p-6"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">A useful habit</p><h3 className="mt-2 font-serif text-xl font-semibold">Photograph the same plant twice.</h3><p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">A second look 48 hours later often tells you more than a single snapshot. CropCare keeps your notes together so patterns become easier to spot.</p></div><CalendarDays size={22} className="text-primary" /></div></div><div className="rounded-2xl bg-[hsl(var(--secondary))] p-6"><CircleHelp size={20} className="text-primary" /><h3 className="mt-3 font-serif text-lg font-semibold">Not sure what to photograph?</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Choose the clearest leaf and include a little context around it.</p><button type="button" data-testid="button-photo-guide" onClick={() => setLocation('/diagnose')} className="mt-4 text-xs font-bold text-primary hover:underline">See the photo guide <ArrowRight size={13} className="ml-1 inline" /></button></div></div>
  </div>;
}

function StatCard({ label, value, detail, icon, tone = 'green' }: { label: string; value: string; detail: string; icon: ReactNode; tone?: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]"><div className="flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone === 'amber' ? 'bg-[hsl(var(--accent)/.18)] text-[hsl(35_65%_39%)]' : tone === 'clay' ? 'bg-[hsl(7_55%_46%/.12)] text-destructive' : 'bg-[hsl(var(--primary)/.1)] text-primary'}`}>{icon}</div><span className="font-mono text-[10px] text-muted-foreground">LIVE</span></div><div className="mt-5 font-serif text-3xl font-semibold">{value}</div><p className="mt-1 text-xs font-semibold">{label}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div>;
}

function Diagnose({ onSave }: { onSave: (items: Diagnosis[]) => void }) {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [crop, setCrop] = useState('Tomato');
  const [area, setArea] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickFile = (next: File | undefined) => { if (!next || !next.type.startsWith('image/')) return; setFile(next); setPreview(URL.createObjectURL(next)); };
  const runScreening = () => {
    if (!file) return;
    setLoading(true);
    window.setTimeout(() => {
      const item: Diagnosis = { id: `cc-${Date.now().toString().slice(-6)}`, crop, area: area || 'Unmarked field', date: new Date().toISOString(), status: crop === 'Cucumber' ? 'Needs attention' : 'Healthy', confidence: crop === 'Cucumber' ? 84 : 91, image: preview, finding: crop === 'Cucumber' ? 'Possible early powdery mildew' : 'No visible signs of stress', advice: crop === 'Cucumber' ? 'Improve airflow around the plant and inspect nearby leaves over the next 48 hours.' : 'Keep your current watering rhythm and continue checking new growth weekly.' };
      const current = readDiagnoses(); onSave([item, ...current]); setLoading(false); setLocation(`/result/${item.id}`);
    }, 1450);
  };
  return <div className="animate-rise-in max-w-5xl"><div className="mb-8 max-w-2xl"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">New field note</p><h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Let's look closely.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">A good photo is the best starting point. We'll look for visible patterns — not replace an expert's eye.</p></div>
    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)] sm:p-7"><div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }} className={`relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${dragging ? 'border-primary bg-[hsl(var(--primary)/.08)]' : 'border-[hsl(var(--primary)/.23)] bg-[hsl(var(--background))]'}`}>{preview ? <><img src={preview} alt="Selected plant" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--foreground)/.6)] to-transparent" /><div className="absolute bottom-4 left-4 right-4 flex items-end justify-between"><div className="text-left text-[hsl(var(--card))]"><p className="text-sm font-bold">{file?.name}</p><p className="mt-1 text-[11px] opacity-75">Ready for a first look</p></div><button type="button" data-testid="button-remove-image" onClick={() => { setFile(null); setPreview(''); }} className="rounded-lg bg-[hsl(var(--foreground)/.5)] p-2 text-[hsl(var(--card))]"><X size={16} /></button></div></> : <><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/.1)] text-primary"><ImagePlus size={25} /></div><p className="text-sm font-bold">Drop a plant photo here</p><p className="mt-1 text-xs text-muted-foreground">JPG or PNG · up to 10 MB</p><button type="button" data-testid="button-choose-photo" onClick={() => fileRef.current?.click()} className="mt-5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-secondary">Choose a photo</button><input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} data-testid="input-plant-photo" /></>}</div><div className="mt-6 flex items-start gap-3 rounded-xl bg-[hsl(var(--secondary)/.55)] p-4"><CircleHelp size={16} className="mt-0.5 shrink-0 text-primary" /><p className="text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">For a clearer read:</strong> use daylight, keep the plant in focus, and include the full leaf if possible.</p></div></div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)] sm:p-7"><h3 className="font-serif text-xl font-semibold">A little context</h3><p className="mt-1 text-xs text-muted-foreground">This helps keep your field log useful.</p><label className="mt-7 block text-xs font-bold">What are you growing?</label><div className="relative mt-2"><select data-testid="select-crop" value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full appearance-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"><option>Tomato</option><option>Cucumber</option><option>Pepper</option><option>Squash</option><option>Bean</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-muted-foreground" /></div><label className="mt-5 block text-xs font-bold">Where is it? <span className="font-normal text-muted-foreground">(optional)</span></label><input data-testid="input-field-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Glasshouse · Bed B" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15" /><button type="button" data-testid="button-run-screening" disabled={!file || loading} onClick={runScreening} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" /> Reading the leaf…</> : <>Run screening <ArrowRight size={16} /></>}</button><p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">Your photo stays in this browser. CropCare gives a visual screening, not a confirmed diagnosis.</p></div></div>
  </div>;
}

function DiagnosisRow({ item, index = 0 }: { item: Diagnosis; index?: number }) {
  const [, setLocation] = useLocation();
  return <button type="button" data-testid={`button-open-diagnosis-${item.id}`} onClick={() => setLocation(`/result/${item.id}`)} className={`group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-md)] animate-rise-in animate-delay-${Math.min(index + 1, 3)}`}><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[hsl(var(--secondary))] text-primary">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <Leaf size={20} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{item.crop}</p><StatusPill status={item.status} /></div><p className="mt-1 truncate text-xs text-muted-foreground">{item.finding} · {item.area}</p></div><div className="hidden text-right sm:block"><p className="font-mono text-[10px] text-muted-foreground">{formatDate(item.date)}</p><p className="mt-1 text-[11px] font-semibold text-primary">{item.confidence}% confidence</p></div><ArrowRight size={16} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" /></button>;
}

function StatusPill({ status }: { status: Diagnosis['status'] }) {
  const style = status === 'Healthy' ? 'bg-[hsl(var(--primary)/.1)] text-primary' : status === 'Monitor' ? 'bg-[hsl(var(--accent)/.2)] text-[hsl(35_65%_35%)]' : 'bg-[hsl(var(--destructive)/.1)] text-destructive';
  return <span data-testid={`status-${status.toLowerCase().replace(' ', '-')}`} className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${style}`}>{status}</span>;
}

function History({ diagnoses, onDelete }: { diagnoses: Diagnosis[]; onDelete: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | Diagnosis['status']>('All');
  const [confirm, setConfirm] = useState<string | null>(null);
  const filtered = useMemo(() => diagnoses.filter((item) => (filter === 'All' || item.status === filter) && `${item.crop} ${item.area} ${item.finding}`.toLowerCase().includes(query.toLowerCase())), [diagnoses, filter, query]);
  return <div className="animate-rise-in"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Your field log</p><h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">History</h2><p className="mt-2 text-sm text-muted-foreground">A running record of what you've noticed and when.</p></div><Link href="/diagnose" data-testid="link-new-screening" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground"><Sparkles size={15} /> New screening</Link></div><div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-muted-foreground" /><input data-testid="input-search-history" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search crops, areas, or findings…" className="w-full rounded-xl bg-background py-2.5 pl-9 pr-3 text-sm outline-none ring-1 ring-inset ring-transparent focus:ring-primary/30" /></div><div className="flex gap-1 overflow-auto rounded-xl bg-background p-1"><Filter size={15} className="my-2.5 ml-2 text-muted-foreground" />{(['All', 'Healthy', 'Monitor', 'Needs attention'] as const).map((value) => <button type="button" key={value} data-testid={`button-filter-${value.toLowerCase().replace(' ', '-')}`} onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold transition ${filter === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{value}</button>)}</div></div><div className="mt-5 flex items-center justify-between text-xs text-muted-foreground"><span>{filtered.length} {filtered.length === 1 ? 'screening' : 'screenings'}</span><span className="font-mono text-[10px] uppercase tracking-wider">Newest first</span></div><div className="mt-3 grid gap-3">{filtered.length ? filtered.map((item, index) => <div key={item.id} className="group relative"><DiagnosisRow item={item} index={index} /><button type="button" data-testid={`button-delete-diagnosis-${item.id}`} aria-label={`Delete ${item.crop} screening`} onClick={() => setConfirm(item.id)} className="absolute bottom-3 right-12 rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-[hsl(var(--destructive)/.1)] hover:text-destructive group-hover:opacity-100 focus:opacity-100"><Trash2 size={14} /></button></div>) : <EmptyState search={Boolean(query || filter !== 'All')} />}</div>{confirm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--foreground)/.28)] p-5"><div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-[var(--shadow-md)]"><h3 className="font-serif text-xl font-semibold">Remove this screening?</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">This field note will be removed from this browser's history.</p><div className="mt-6 flex justify-end gap-2"><button type="button" data-testid="button-cancel-delete" onClick={() => setConfirm(null)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted">Keep it</button><button type="button" data-testid="button-confirm-delete" onClick={() => { onDelete(confirm); setConfirm(null); }} className="rounded-xl bg-destructive px-4 py-2.5 text-xs font-bold text-destructive-foreground">Remove</button></div></div></div>}</div>;
}

function EmptyState({ search = false }: { search?: boolean }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-primary">{search ? <Search size={20} /> : <FolderOpen size={20} />}</div><h3 className="mt-4 font-serif text-lg font-semibold">{search ? 'Nothing matches that search' : 'Your field log is waiting'}</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{search ? 'Try a crop name, field area, or choose a different filter.' : 'Run your first screening to start noticing patterns over time.'}</p></div>;
}

function Result({ diagnoses }: { diagnoses: Diagnosis[] }) {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const item = diagnoses.find((diagnosis) => diagnosis.id === id);
  if (!item) return <div className="py-16 text-center"><p className="font-serif text-2xl font-semibold">That field note has moved.</p><button type="button" data-testid="button-return-history" onClick={() => setLocation('/history')} className="mt-4 text-xs font-bold text-primary">Return to history</button></div>;
  const healthy = item.status === 'Healthy';
  return <div className="animate-rise-in max-w-5xl"><button type="button" data-testid="button-back-from-result" onClick={() => setLocation('/history')} className="mb-7 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Back to history</button><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Screening result · {formatDate(item.date)}</p><h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">{item.crop} at a glance</h2><p className="mt-2 text-sm text-muted-foreground">{item.area}</p></div><StatusPill status={item.status} /></div><div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[hsl(var(--secondary))]">{item.image ? <img src={item.image} alt={`${item.crop} screening`} className="h-full min-h-[360px] w-full object-cover" /> : <div className="field-grid flex h-full min-h-[360px] items-center justify-center"><Leaf size={78} strokeWidth={1} className="text-primary/50" /></div>}<div className="absolute bottom-4 left-4 rounded-xl bg-[hsl(var(--card)/.9)] px-3 py-2 backdrop-blur"><p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Visual confidence</p><p className="mt-0.5 font-serif text-2xl font-semibold text-primary">{item.confidence}%</p></div></div><div className="rounded-2xl border border-border bg-card p-6 sm:p-8"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${healthy ? 'bg-[hsl(var(--primary)/.1)] text-primary' : 'bg-[hsl(var(--accent)/.2)] text-[hsl(35_65%_35%)]'}`}>{healthy ? <Check size={24} /> : <Activity size={24} />}</div><p className="mt-6 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">First read</p><h3 className="mt-2 font-serif text-3xl font-semibold">{item.finding}</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{healthy ? 'This is encouraging. We did not spot a clear visual pattern associated with common crop stress in this photo.' : 'There is a pattern worth checking in person. This is not a confirmed diagnosis — use it as a prompt for a closer look.'}</p><div className="my-7 h-px bg-border" /><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">A practical next step</p><p className="mt-2 text-sm font-semibold leading-relaxed">{item.advice}</p><button type="button" data-testid="button-screen-another" onClick={() => setLocation('/diagnose')} className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-xs font-bold text-primary hover:bg-secondary">Screen another plant <ArrowRight size={15} /></button></div></div><div className="mt-5 flex items-start gap-3 rounded-2xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.09)] p-5"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" /><p className="text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Keep perspective.</strong> CropCare is designed to help you decide what to look at next. For a spreading issue or a high-value crop, share this photo with your agronomist.</p></div></div>;
}

function Dashboard({ diagnoses }: { diagnoses: Diagnosis[] }) {
  const statuses = ['Healthy', 'Needs attention', 'Monitor'] as const;
  const total = Math.max(diagnoses.length, 1);
  return <div className="animate-rise-in"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Your growing season</p><h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Patterns worth noticing</h2><p className="mt-2 text-sm text-muted-foreground">A simple view of the plants you've checked so far.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-3">{statuses.map((status) => { const count = diagnoses.filter((item) => item.status === status).length; return <div key={status} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><StatusPill status={status} /><span className="font-mono text-[10px] text-muted-foreground">{Math.round((count / total) * 100)}%</span></div><p className="mt-6 font-serif text-4xl font-semibold">{count}</p><p className="mt-1 text-xs text-muted-foreground">screenings</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${status === 'Healthy' ? 'bg-primary' : status === 'Monitor' ? 'bg-[hsl(var(--accent))]' : 'bg-destructive'}`} style={{ width: `${Math.max((count / total) * 100, count ? 4 : 0)}%` }} /></div></div>; })}</div><div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Recent activity</p><h3 className="mt-1 font-serif text-2xl font-semibold">Your last looks</h3></div><Activity size={20} className="text-primary" /></div><div className="mt-5 grid gap-2">{diagnoses.slice(0, 5).map((item) => <div key={item.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-primary">{item.image ? <img src={item.image} alt="" className="h-full w-full rounded-lg object-cover" /> : <Leaf size={16} />}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold">{item.crop}</p><p className="truncate text-[11px] text-muted-foreground">{item.finding}</p></div><p className="font-mono text-[10px] text-muted-foreground">{formatDate(item.date)}</p></div>)}</div></div><div className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]"><BarChart3 size={21} className="text-[hsl(var(--accent))]" /><h3 className="mt-5 font-serif text-2xl font-semibold">Small patterns add up.</h3><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--primary-foreground)/.7)]">Use your log as a conversation starter. Trends become more useful when paired with what you see, touch, and know about your field.</p><Link href="/history" data-testid="link-dashboard-history" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--accent))]">Browse field log <ArrowRight size={15} /></Link></div></div></div>;
}

export default App;