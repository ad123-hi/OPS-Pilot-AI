import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { api, getErrorMessage, type Organization } from "./api";

type Screen = "login" | "register" | "dashboard" | "guide";
type IconName =
  | "overview"
  | "work"
  | "playbook"
  | "team"
  | "settings"
  | "chevron"
  | "logout"
  | "menu"
  | "close"
  | "plus"
  | "arrow"
  | "check"
  | "warning"
  | "eye"
  | "eyeOff"
  | "spark";

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    work: (
      <>
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 11h18M10 11v2h4v-2" />
      </>
    ),
    playbook: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M9 7h6M9 11h7" />
      </>
    ),
    team: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.36.7.65.96.3.26.68.4 1.08.4H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5M21 12H9" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    close: <path d="M18 6 6 18M6 6l12 12" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    warning: (
      <>
        <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.1 3.2M6.6 6.6C3.6 8.3 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.1-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z" />
        <path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 15l-.7 1.8-1.8.7 1.8.7L19 20l.7-1.8 1.8-.7-1.8-.7L19 15Z" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`grid h-8 w-8 place-items-center rounded-[9px] ${light ? "bg-white text-[#163c34]" : "bg-[#163c34] text-white"}`}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 5.5h7a3.5 3.5 0 1 1 0 7H8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="5" cy="12.5" r="2" fill="#E7A449" />
        </svg>
      </div>
      <span
        className={`text-[17px] font-semibold tracking-[-0.02em] ${light ? "text-white" : "text-[#17201e]"}`}
      >
        OpsPilot
      </span>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#273532]">{label}</span>
      <span className="relative block">
        <input
          type={password && visible ? "text" : type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={`h-11 w-full rounded-lg border bg-white px-3.5 text-[14px] text-[#17201e] outline-none transition placeholder:text-[#8b9995] focus:ring-3 ${password ? "pr-11" : ""} ${error ? "border-[#c65347] focus:border-[#c65347] focus:ring-[#c65347]/10" : "border-[#ccd5d2] hover:border-[#a9b7b3] focus:border-[#26705f] focus:ring-[#26705f]/10"}`}
          placeholder={placeholder}
        />
        {password && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#60716d] hover:text-[#1d4c42]"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            <Icon name={visible ? "eyeOff" : "eye"} size={17} />
          </button>
        )}
      </span>
      {(error || hint) && (
        <span
          className={`mt-1.5 flex items-center gap-1.5 text-[12px] ${error ? "text-[#b23f35]" : "text-[#697874]"}`}
        >
          {error && <Icon name="warning" size={13} />} {error || hint}
        </span>
      )}
    </label>
  );
}

function AuthShell({
  children,
  screen,
  onNavigate,
}: {
  children: ReactNode;
  screen: Screen;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <main className="min-h-screen bg-[#f3f5f3] text-[#17201e] lg:grid lg:grid-cols-[minmax(460px,1fr)_minmax(560px,1.12fr)]">
      <section className="relative hidden overflow-hidden bg-[#173f36] px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 auth-pattern opacity-40" />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative my-auto max-w-[520px] pb-10">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#f1bf75]">
            <Icon name="spark" size={21} />
          </div>
          <h1 className="text-[40px] font-semibold leading-[1.12] tracking-[-0.035em]">
            Operations stay clear,
            <br />
            even when work gets busy.
          </h1>
          <p className="mt-5 max-w-[470px] text-[16px] leading-7 text-[#c6d7d2]">
            Give your team one dependable place for procedures, ownership, and the work that keeps
            the business moving.
          </p>
        </div>
        <div className="relative flex items-center gap-3 border-t border-white/12 pt-6 text-[13px] text-[#adc5bf]">
          <span>Structured work</span>
          <span className="h-1 w-1 rounded-full bg-[#e7a449]" />
          <span>Clear ownership</span>
          <span className="h-1 w-1 rounded-full bg-[#e7a449]" />
          <span>Consistent execution</span>
        </div>
      </section>
      <section className="flex min-h-screen flex-col bg-[#fbfcfb]">
        <header className="flex h-18 items-center justify-between border-b border-[#e5e9e7] px-5 lg:border-0 lg:px-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <button
            onClick={() => onNavigate("guide")}
            className="ml-auto text-[12px] font-medium text-[#60716d] underline-offset-4 hover:text-[#1d4c42] hover:underline"
          >
            View design guide
          </button>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[420px]" key={screen}>
            {children}
          </div>
        </div>
        <footer className="px-5 py-6 text-center text-[12px] text-[#7c8985]">
          © 2025 OpsPilot · Privacy · Security
        </footer>
      </section>
    </main>
  );
}

function Login({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationId, setOrganizationId] = useState(localStorage.getItem("opspilot_organization_id") || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!email) next.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    if (!organizationId || !/^\d+$/.test(organizationId)) next.organizationId = "Enter your organization ID.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    login({ email, password, organization_id: Number(organizationId) })
      .then(() => { localStorage.setItem("opspilot_organization_id", organizationId); onNavigate("dashboard"); })
      .catch((error: unknown) => setErrors({ form: getErrorMessage(error) }))
      .finally(() => setLoading(false));
  }

  return (
    <AuthShell screen="login" onNavigate={onNavigate}>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#26705f]">
        Welcome back
      </p>
      <h2 className="text-[30px] font-semibold tracking-[-0.035em] text-[#17201e]">
        Sign in to OpsPilot
      </h2>
      <p className="mt-2 text-[14px] leading-6 text-[#697874]">
        Continue to your organization’s workspace.
      </p>
      {errors.form && (
        <div className="mt-6 flex gap-3 rounded-lg border border-[#e5b7b2] bg-[#fff7f6] p-3.5 text-[13px] text-[#9f3931]">
          <Icon name="warning" size={17} />
          <span>{errors.form}</span>
        </div>
      )}
      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        <Field label="Organization ID" placeholder="Provided by your organization" value={organizationId} onChange={(v) => { setOrganizationId(v); setErrors({ ...errors, organizationId: "" }); }} error={errors.organizationId} hint="Ask your organization’s administrator for this ID." />
        <Field
          label="Work email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setErrors({ ...errors, email: "" });
          }}
          error={errors.email}
          autoComplete="email"
        />
        <div>
          <Field
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              setErrors({ ...errors, password: "" });
            }}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="mt-2 text-right">
            <button
              type="button"
              className="text-[12px] font-medium text-[#26705f] hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>
        <button
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1d594c] px-4 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(16,42,36,.2)] transition hover:bg-[#17483e] focus:outline-none focus:ring-3 focus:ring-[#26705f]/20 disabled:cursor-wait disabled:bg-[#88a59e]"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-7 text-center text-[13px] text-[#697874]">
        New to OpsPilot?{" "}
        <button
          onClick={() => onNavigate("register")}
          className="font-semibold text-[#1d594c] hover:underline"
        >
          Create an organization
        </button>
      </p>
    </AuthShell>
  );
}

function Registration({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [values, setValues] = useState({ org: "", name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const { register } = useAuth();
  const set = (key: string, value: string) => {
    setValues({ ...values, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };
  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.org.trim()) next.org = "Enter your organization name.";
    if (!values.name.trim()) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid work email.";
    if (values.password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    register({ organization_name: values.org.trim(), full_name: values.name.trim(), email: values.email.trim(), password: values.password })
      .then(() => {
        const storedUser = localStorage.getItem("opspilot_user");
        if (storedUser) setOrganizationId(JSON.parse(storedUser).organization_id as number);
        setSuccess(true);
      })
      .catch((error: unknown) => setErrors({ form: getErrorMessage(error) }))
      .finally(() => setLoading(false));
  }
  if (success)
    return (
      <AuthShell screen="register" onNavigate={onNavigate}>
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-[#e5f2ed] text-[#1d6b59]">
          <Icon name="check" size={24} />
        </div>
        <h2 className="text-[30px] font-semibold tracking-[-0.035em]">Your workspace is ready</h2>
        <p className="mt-3 text-[14px] leading-6 text-[#697874]">
          <strong className="font-medium text-[#273532]">{values.org}</strong> has been created.
          You’re its first Admin{organizationId ? ` (organization ID ${organizationId})` : ""}. Keep this ID handy for future sign-ins.
        </p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1d594c] text-[14px] font-semibold text-white hover:bg-[#17483e]"
        >
          Open workspace <Icon name="arrow" size={16} />
        </button>
      </AuthShell>
    );
  return (
    <AuthShell screen="register" onNavigate={onNavigate}>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#26705f]">
        Get started
      </p>
      <h2 className="text-[30px] font-semibold tracking-[-0.035em]">Create your workspace</h2>
      <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-[#697874]">
        This creates a new organization and makes you its first Admin.
      </p>
      {errors.form && <div className="mt-4 rounded-lg border border-[#e5b7b2] bg-[#fff7f6] p-3.5 text-[13px] text-[#9f3931]">{errors.form}</div>}
      <form className="mt-7 space-y-4" onSubmit={submit} noValidate>
        <Field
          label="Organization name"
          placeholder="Northstar Logistics"
          value={values.org}
          onChange={(v) => set("org", v)}
          error={errors.org}
          autoComplete="organization"
        />
        <Field
          label="Full name"
          placeholder="Alex Morgan"
          value={values.name}
          onChange={(v) => set("name", v)}
          error={errors.name}
          autoComplete="name"
        />
        <Field
          label="Work email"
          type="email"
          placeholder="alex@company.com"
          value={values.email}
          onChange={(v) => set("email", v)}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          placeholder="Create a secure password"
          value={values.password}
          onChange={(v) => set("password", v)}
          error={errors.password}
          hint={
            !errors.password
              ? "At least 8 characters. Avoid common or reused passwords."
              : undefined
          }
          autoComplete="new-password"
        />
        <label className="flex items-start gap-2.5 pt-1 text-[12px] leading-5 text-[#697874]">
          <input required type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1d594c]" />{" "}
          <span>
            I agree to the{" "}
            <button type="button" className="text-[#1d594c] underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" className="text-[#1d594c] underline">
              Privacy Policy
            </button>
            .
          </span>
        </label>
        <button
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1d594c] text-[14px] font-semibold text-white hover:bg-[#17483e] disabled:cursor-wait disabled:bg-[#88a59e]"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "Creating workspace…" : "Create organization"}
        </button>
      </form>
      <p className="mt-6 text-center text-[13px] text-[#697874]">
        Already have an account?{" "}
        <button
          onClick={() => onNavigate("login")}
          className="font-semibold text-[#1d594c] hover:underline"
        >
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}

const navItems: { label: string; icon: IconName; badge?: string }[] = [
  { label: "Overview", icon: "overview" },
  { label: "Work", icon: "work", badge: "0" },
  { label: "Playbooks", icon: "playbook" },
  { label: "Team", icon: "team" },
];

function Sidebar({
  active,
  setActive,
  open,
  close,
  onGuide,
  workspaceName,
}: {
  active: string;
  setActive: (s: string) => void;
  open: boolean;
  close: () => void;
  onGuide: () => void;
  workspaceName: string;
}) {
  return (
    <>
      {open && (
        <button
          onClick={close}
          className="fixed inset-0 z-30 bg-[#0a1d18]/35 lg:hidden"
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#dfe6e3] bg-[#f8faf9] transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <Logo />
          <button
            onClick={close}
            className="rounded-md p-2 text-[#60716d] hover:bg-[#edf1ef] lg:hidden"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="mx-3 mt-4 rounded-lg border border-[#dfe6e3] bg-white px-3 py-2.5">
          <p className="truncate text-[13px] font-semibold text-[#273532]">{workspaceName}</p>
          <p className="mt-0.5 text-[11px] text-[#7c8985]">Operations workspace</p>
        </div>
        <nav className="mt-5 flex-1 px-3" aria-label="Main navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a9894]">
            Workspace
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActive(item.label);
                  close();
                }}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition ${active === item.label ? "bg-[#dfece7] text-[#184f43]" : "text-[#53635f] hover:bg-[#edf1ef] hover:text-[#273532]"}`}
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[11px] text-[#879590]">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
          <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a9894]">
            Manage
          </p>
          <button
            onClick={() => setActive("Settings")}
            className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium ${active === "Settings" ? "bg-[#dfece7] text-[#184f43]" : "text-[#53635f] hover:bg-[#edf1ef]"}`}
          >
            <Icon name="settings" size={17} />
            Settings
          </button>
        </nav>
        <div className="border-t border-[#e1e7e4] p-3">
          <button
            onClick={onGuide}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[12px] text-[#697874] hover:bg-[#edf1ef]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md border border-[#d5dedb] bg-white text-[#1d594c]">
              Aa
            </span>
            <span>
              <strong className="block font-medium text-[#3e4d49]">Design system</strong>Handoff
              reference
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [active, setActive] = useState("Overview");
  const [menu, setMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const { user, logout } = useAuth();
  useEffect(() => { api.get<Organization>("/organizations/me").then(({ data }) => setOrganization(data)).catch(() => undefined); }, []);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = (user?.full_name || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="flex min-h-screen bg-[#f5f7f6] text-[#17201e]">
      <Sidebar
        active={active}
        setActive={setActive}
        open={mobileNav}
        close={() => setMobileNav(false)}
        onGuide={() => onNavigate("guide")}
        workspaceName={organization?.name || "Your workspace"}
      />
      <div className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[#dfe6e3] bg-white px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(true)}
              className="rounded-lg p-2 text-[#52625e] hover:bg-[#edf1ef] lg:hidden"
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>
            <div>
              <h1 className="text-[17px] font-semibold tracking-[-0.015em]">{active}</h1>
              <p className="hidden text-[11px] text-[#7c8985] sm:block">{new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu(!menu)}
              aria-expanded={menu}
              className="flex items-center gap-2 rounded-lg p-1.5 pr-2 text-left transition hover:bg-[#f0f3f2]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e5efe9] text-[11px] font-bold text-[#1d594c]">
                {initials}
              </span>
              <span className="hidden sm:block">
                  <span className="block text-[12px] font-semibold">{user?.full_name}</span>
                  <span className="block text-[10px] capitalize text-[#7c8985]">{user?.role}</span>
              </span>
              <Icon
                name="chevron"
                size={14}
                className={`ml-1 text-[#7c8985] transition ${menu ? "rotate-90" : ""}`}
              />
            </button>
            {menu && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[228px] overflow-hidden rounded-xl border border-[#dbe3e0] bg-white shadow-[0_12px_32px_rgba(18,39,34,.12)]">
                <div className="border-b border-[#edf0ef] px-4 py-3">
                  <p className="text-[12px] font-semibold">{user?.full_name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#768581]">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] text-[#475652] hover:bg-[#f2f5f3]">
                    <Icon name="settings" size={15} />
                    Account settings
                  </button>
                  <button
                    onClick={() => { void logout().finally(() => onNavigate("login")); }}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] text-[#a33b32] hover:bg-[#fff5f4]"
                  >
                    <Icon name="logout" size={15} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1160px] px-4 py-7 sm:px-7 sm:py-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[12px] font-medium text-[#26705f]">Workspace setup</p>
                <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.035em] sm:text-[30px]">
                Welcome, {user?.full_name?.split(" ")[0] || "there"}
              </h2>
              <p className="mt-2 text-[14px] text-[#697874]">
                Let’s get {organization?.name || "your organization"} ready for the team.
              </p>
            </div>
            <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1d594c] px-4 text-[13px] font-semibold text-white hover:bg-[#17483e]">
              <Icon name="plus" size={16} /> Create work item
            </button>
          </div>
          <section className="mt-8 overflow-hidden rounded-xl border border-[#dce4e1] bg-white shadow-[0_1px_2px_rgba(18,39,34,.03)]">
            <div className="border-b border-[#e6ebe9] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold">Get your workspace running</h3>
                  <p className="mt-1 text-[12px] text-[#74827e]">1 of 3 steps complete</p>
                </div>
                <span className="text-[12px] font-semibold text-[#26705f]">33%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8edeb]">
                <div className="h-full w-1/3 rounded-full bg-[#26705f]" />
              </div>
            </div>
            <div className="divide-y divide-[#edf0ef]">
              <SetupRow
                done
                title="Create your organization"
                description={`${organization?.name || "Your organization"} is ready.`}
              />
              <SetupRow
                title="Build your first playbook"
                description="Document a repeatable process your team can follow."
                cta="Create playbook"
              />
              <SetupRow
                title="Invite your operations team"
                description="Add teammates when you’re ready to collaborate."
                cta="Invite team"
              />
            </div>
          </section>
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold">Work overview</h3>
              <button className="text-[12px] font-medium text-[#26705f] hover:underline">
                View all work
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Open work", "0", "Items currently in progress"],
                ["Due this week", "0", "Nothing due yet"],
                ["Needs attention", "0", "No blockers reported"],
              ].map(([label, value, desc]) => (
                <div key={label} className="rounded-xl border border-[#dfe6e3] bg-white p-5">
                  <p className="text-[12px] font-medium text-[#697874]">{label}</p>
                  <p className="mt-3 text-[28px] font-semibold tracking-[-0.04em]">{value}</p>
                  <p className="mt-1 text-[11px] text-[#8a9894]">{desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="mt-7 rounded-xl border border-dashed border-[#cbd6d2] bg-[#fafcfb] px-5 py-9 text-center sm:py-12">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg border border-[#dce5e2] bg-white text-[#26705f] shadow-sm">
              <Icon name="work" size={19} />
            </div>
            <h3 className="mt-4 text-[14px] font-semibold">No work has been created yet</h3>
            <p className="mx-auto mt-1.5 max-w-[390px] text-[12px] leading-5 text-[#74827e]">
              Start with a recurring operational task, an open issue, or a process that needs a
              clear owner.
            </p>
            <button className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1d594c] hover:underline">
              Create your first work item <Icon name="arrow" size={14} />
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

function SetupRow({
  done,
  title,
  description,
  cta,
}: {
  done?: boolean;
  title: string;
  description: string;
  cta?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${done ? "bg-[#dfeee8] text-[#1d6b59]" : "border border-[#d4ddda] bg-white text-[#879590]"}`}
      >
        {done ? (
          <Icon name="check" size={15} />
        ) : (
          <span className="h-2 w-2 rounded-full bg-[#c6d0cd]" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-medium ${done ? "text-[#697874]" : "text-[#273532]"}`}>
          {title}
        </p>
        <p className="mt-0.5 hidden text-[11px] text-[#879590] sm:block">{description}</p>
      </div>
      {cta && (
        <button className="shrink-0 rounded-md border border-[#ced8d5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#35534c] hover:bg-[#f3f6f5]">
          {cta}
        </button>
      )}
    </div>
  );
}

function StyleGuide({ onBack }: { onBack: () => void }) {
  const colors = [
    ["Evergreen", "#1D594C"],
    ["Deep ink", "#17201E"],
    ["Canvas", "#F5F7F6"],
    ["Border", "#DFE6E3"],
    ["Amber", "#E7A449"],
    ["Error", "#B23F35"],
  ];
  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#17201e]">
      <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-[#dfe6e3] bg-white/95 px-5 backdrop-blur sm:px-8">
        <Logo />
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-[#d2dcda] px-3 py-2 text-[12px] font-semibold text-[#455550] hover:bg-[#f1f4f3]"
        >
          Back to product
        </button>
      </header>
      <div className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#26705f]">
          Day 04 · Developer handoff
        </p>
        <h1 className="mt-3 text-[34px] font-semibold tracking-[-.04em] sm:text-[42px]">
          OpsPilot interface guide
        </h1>
        <p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#697874]">
          A compact reference for building calm, accessible operations software. Prioritize
          scanability, explicit status, and dependable interaction over decoration.
        </p>
        <GuideSection number="01" title="Color">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {colors.map(([name, hex]) => (
              <div
                key={name}
                className="overflow-hidden rounded-lg border border-[#dfe6e3] bg-white"
              >
                <div className="h-16" style={{ background: hex }} />
                <div className="p-3">
                  <p className="text-[11px] font-semibold">{name}</p>
                  <p className="mt-1 text-[10px] text-[#7c8985]">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </GuideSection>
        <GuideSection number="02" title="Typography & spacing">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[#dfe6e3] bg-white p-6">
              <p className="text-[32px] font-semibold tracking-[-.04em]">Page heading</p>
              <p className="mt-2 text-[17px] font-semibold">Section heading</p>
              <p className="mt-3 text-[14px] text-[#697874]">
                Body copy uses IBM Plex Sans for a practical, highly legible voice.
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[#7c8985]">
                Eyebrow / label
              </p>
            </div>
            <div className="rounded-xl border border-[#dfe6e3] bg-white p-6">
              <p className="text-[12px] font-semibold">4px base grid</p>
              <div className="mt-5 flex items-end gap-4">
                {[4, 8, 12, 16, 24, 32].map((n) => (
                  <div className="text-center" key={n}>
                    <div className="mx-auto w-5 rounded-sm bg-[#8bb5aa]" style={{ height: n }} />
                    <span className="mt-2 block text-[10px] text-[#7c8985]">{n}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[11px] leading-5 text-[#7c8985]">
                Controls: 40–44px · Cards: 20–24px padding · Page gutters: 16 / 28px
              </p>
            </div>
          </div>
        </GuideSection>
        <GuideSection number="03" title="Buttons & fields">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#dfe6e3] bg-white p-6">
              <button className="h-10 rounded-lg bg-[#1d594c] px-4 text-[12px] font-semibold text-white">
                Primary action
              </button>
              <button className="h-10 rounded-lg border border-[#ced8d5] px-4 text-[12px] font-semibold text-[#35534c]">
                Secondary
              </button>
              <button
                disabled
                className="h-10 rounded-lg bg-[#88a59e] px-4 text-[12px] font-semibold text-white"
              >
                Disabled
              </button>
            </div>
            <div className="rounded-xl border border-[#dfe6e3] bg-white p-6">
              <Field
                label="Field label"
                placeholder="Clear example value"
                value=""
                onChange={() => {}}
                hint="Optional guidance appears below the field."
              />
            </div>
          </div>
        </GuideSection>
        <GuideSection number="04" title="Navigation states">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[#dfe6e3] bg-white p-4">
              <div className="flex h-10 items-center gap-3 rounded-lg bg-[#dfece7] px-3 text-[13px] font-medium text-[#184f43]">
                <Icon name="overview" size={17} />
                Active page
              </div>
              <div className="mt-1 flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-[#53635f]">
                <Icon name="work" size={17} />
                Default page
              </div>
            </div>
            <div className="rounded-xl border border-[#dfe6e3] bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e5efe9] text-[11px] font-bold text-[#1d594c]">
                  AM
                </span>
                <span>
                  <strong className="block text-[12px]">Alex Morgan</strong>
                  <span className="text-[10px] text-[#7c8985]">Admin · Profile menu</span>
                </span>
              </div>
              <p className="mt-4 border-t border-[#edf0ef] pt-3 text-[11px] leading-5 text-[#697874]">
                Menu opens below the trigger, closes on outside click, and groups account actions
                from destructive logout.
              </p>
            </div>
          </div>
        </GuideSection>
        <GuideSection number="05" title="Behavior notes">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Validate on submit, then clear each field error as the user edits.",
              "Disable primary actions and preserve their width while loading.",
              "Mobile navigation uses a modal drawer with a dismissible scrim.",
              "Empty states explain why the area is empty and provide one clear next step.",
            ].map((t, i) => (
              <div key={t} className="rounded-xl border border-[#dfe6e3] bg-white p-5">
                <span className="text-[11px] font-semibold text-[#26705f]">0{i + 1}</span>
                <p className="mt-3 text-[12px] leading-5 text-[#52625e]">{t}</p>
              </div>
            ))}
          </div>
        </GuideSection>
      </div>
    </main>
  );
}

function GuideSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-[#dbe3e0] pt-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="text-[10px] font-semibold text-[#86948f]">{number}</span>
        <h2 className="text-[17px] font-semibold tracking-[-.02em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-[#697874]">Loading your workspace…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const navigateScreen = (screen: Screen) => {
    navigate(screen === "dashboard" ? "/dashboard" : screen === "guide" ? "/guide" : `/${screen}`);
    window.scrollTo(0, 0);
  };
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onNavigate={navigateScreen} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Registration onNavigate={navigateScreen} />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard onNavigate={navigateScreen} /></ProtectedRoute>} />
      <Route path="/guide" element={<StyleGuide onBack={() => navigate(user ? "/dashboard" : "/login")} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}
