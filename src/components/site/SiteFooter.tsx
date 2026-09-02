import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

type FooterLink =
  | { label: string; to: "/"; exact?: boolean }
  | { label: string; to: "/opportunities" }
  | { label: string; to: "/login" }
  | { label: string; to: "/register"; role?: "student" | "client" }
  | { label: string; to: "/cta" };

const footerLinks: Record<string, FooterLink[]> = {
  Platform: [
    { to: "/", label: "Features", exact: true },
    { to: "/opportunities", label: "Opportunities" },
    { to: "/login", label: "Try the Demo" },
    { to: "/register", label: "Get Started" },
  ],
  Company: [
    { to: "/cta", label: "Contact" },
    { to: "/register", label: "Join as Hustler", role: "student" },
    { to: "/register", label: "Hire Talent", role: "client" },
  ],
  Legal: [
    { to: "/cta", label: "Privacy" },
    { to: "/cta", label: "Terms" },
  ],
  Support: [
    { to: "/cta", label: "Help Center" },
    { to: "/cta", label: "FAQ" },
  ],
};

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.to === "/register") {
    return (
      <Link
        to="/register"
        search={{ role: link.role ?? "student" }}
        className="text-sm text-white/60 hover:text-[#F5E400]"
      >
        {link.label}
      </Link>
    );
  }

  return (
    <Link
      to={link.to}
      activeOptions={link.to === "/" ? { exact: true } : undefined}
      className="text-sm text-white/60 hover:text-[#F5E400]"
    >
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-white/5">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Bridging student talent with real-world opportunities. Hustle smarter.
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
              {title}
            </h4>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.label}>
                  <FooterLinkItem link={l} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-white/40">
        © 2026 HustleBridge. Built for the relentless.
      </div>
    </footer>
  );
}
