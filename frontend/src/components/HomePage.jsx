import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FileCheck2,
  HeartPulse,
  House,
  Info,
  Layers,
  Lock,
  Menu,
  MessageSquare,
  Plane,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";
import { INSURANCE_CATEGORIES, SPOOFED_PERSONAS } from "../data/mockClaims";
import { formatRupees } from "../utils/currency";
import { useReveal } from "../hooks/useReveal";
import "./HomePage.css";

const ICON_MAP = { Car, HeartPulse, House, Plane, Building2, Truck, Lock, Shield, User, Layers };

const NAV_LINKS = [
  { id: "cover", label: "What we cover" },
  { id: "why", label: "Why Beema" },
  { id: "how", label: "How it works" },
  { id: "faq", label: "FAQ" },
];

const BENEFITS = [
  {
    icon: Search,
    title: "Cover you can actually compare",
    body: "Every policy is described in the same structure, so you can line up what is included, what is excluded and what you would pay before you commit.",
  },
  {
    icon: Eye,
    title: "A claim you can watch move",
    body: "Each claim shows its current stage, what has been verified and what is still outstanding — instead of leaving you to chase an update.",
  },
  {
    icon: FileCheck2,
    title: "Documents checked as you upload",
    body: "Upload an invoice or report and Beema reads it against your claim, highlighting the figures that match and the ones that need a second look.",
  },
  {
    icon: MessageSquare,
    title: "Plain language, not policy jargon",
    body: "Terms like deductible, excess and sum insured are explained where they appear, so a decision never hinges on vocabulary you were not given.",
  },
];

const STEPS = [
  { title: "Pick the cover you need", body: "Choose from the personal and commercial lines Beema supports, for yourself or for an organisation." },
  { title: "Review what is covered", body: "Read the coverage summary, limits and exclusions side by side before anything is filed." },
  { title: "File with your evidence", body: "Add photos, invoices and reports. Beema checks them against the claim as they arrive." },
  { title: "Track it to settlement", body: "Follow the assessment, see what the decision rested on, and respond if anything is missing." },
];

const FAQS = [
  {
    q: "What is Beema?",
    a: "Beema is an insurance claims platform that brings policy information, claim filing, document verification and claim tracking into one place — for individual policyholders and for organisations managing commercial risk.",
  },
  {
    q: "What does the LAYA engine actually do?",
    a: "LAYA is the assessment layer. It reads the documents and images attached to a claim, compares the figures against the policy and the claim as filed, and produces a recommendation along with the evidence it relied on. A recommendation is an input to a decision, not the decision itself — claims that are unclear or high value are routed to a human assessor.",
  },
  {
    q: "What is the difference between the individual and organisation portals?",
    a: "The individual portal covers retail lines such as vehicle, health, home and travel, where a single policyholder files a claim. The organisation portal covers commercial lines such as captive programmes, fleet and cargo, and cyber liability, where claims are larger, involve more documentation and are managed by a risk team rather than one person.",
  },
  {
    q: "What do deductible and sum insured mean?",
    a: "The deductible (sometimes called the excess) is the part of a claim you pay yourself before cover applies. The sum insured is the maximum the policy will pay over the term. Both appear on every policy and claim in Beema, because together they determine what a settlement is actually worth to you.",
  },
  {
    q: "Is this a live insurance service?",
    a: "No. This is a working demonstration of the platform. The policies, personas, claims and amounts are sample data, and nothing here creates, prices or binds real insurance cover. No real quote is calculated and no payment is taken.",
  },
];

export default function HomePage({ onProceedWithPersona }) {
  const [selectedIndPersonaId, setSelectedIndPersonaId] = useState(SPOOFED_PERSONAS.individual[0].id);
  const [selectedOrgPersonaId, setSelectedOrgPersonaId] = useState(SPOOFED_PERSONAS.organisation[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [stuck, setStuck] = useState(false);

  useReveal();

  // Drives the navbar's glass treatment once the hero scrolls away.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectedIndPersona =
    SPOOFED_PERSONAS.individual.find((p) => p.id === selectedIndPersonaId) || SPOOFED_PERSONAS.individual[0];
  const selectedOrgPersona =
    SPOOFED_PERSONAS.organisation.find((p) => p.id === selectedOrgPersonaId) || SPOOFED_PERSONAS.organisation[0];

  const individualLines = INSURANCE_CATEGORIES.filter((c) => c.segment === "individual");
  const organisationLines = INSURANCE_CATEGORIES.filter((c) => c.segment === "organisation");

  const goToSection = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  };

  // A category card is a real entry point: it opens the portal for that
  // segment already set to the chosen line of cover.
  const enterWithCategory = (category) => {
    const persona = category.segment === "organisation" ? selectedOrgPersona : selectedIndPersona;
    onProceedWithPersona({ ...persona, defaultCategory: category.id, activeClaimId: null });
  };

  const renderPortal = ({ segment, kicker, title, description, icon: Icon, color, tint, lines, personas, selectedId, onSelect, persona }) => (
    <div className="bm-portal" style={{ "--portal-color": color, "--portal-tint": tint }}>
      <div className="bm-portal__stripe" />
      <div className="bm-portal__body">
        <div className="bm-portal__head">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="bm-portal__icon">
              <Icon size={23} strokeWidth={2.2} />
            </div>
            <div>
              <span className="bm-portal__kicker">{kicker}</span>
              <h3 className="bm-portal__title">{title}</h3>
            </div>
          </div>
        </div>

        <p className="bm-portal__desc">{description}</p>

        <div className="bm-portal__lines">
          {lines.map((line) => {
            const LineIcon = ICON_MAP[line.icon] || Shield;
            return (
              <div key={line.id} className="bm-portal__line">
                <LineIcon size={15} color={line.color} aria-hidden="true" />
                <span>{line.shortName || line.name}</span>
              </div>
            );
          })}
        </div>

        <div className="bm-persona">
          <span className="bm-persona__label" id={`persona-label-${segment}`}>
            Choose a sample profile
          </span>

          <div className="bm-persona__options" role="group" aria-labelledby={`persona-label-${segment}`}>
            {personas.map((option) => (
              <button
                key={option.id}
                type="button"
                className="bm-persona__option"
                aria-pressed={selectedId === option.id}
                onClick={() => onSelect(option.id)}
              >
                {selectedId === option.id && <Check size={14} aria-hidden="true" />}
                <span>{option.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          <div className="bm-persona__card">
            <div className="bm-persona__who">
              <div className="bm-avatar" style={{ backgroundColor: persona.avatarBg }} aria-hidden="true">
                {persona.avatarInitials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="bm-persona__name">{persona.name}</div>
                <div className="bm-persona__meta">
                  {persona.title} &middot; {persona.identifier}
                </div>
              </div>
            </div>
            <div className="bm-persona__amount">
              <span>Open claim</span>
              <strong>{formatRupees(persona.claimedAmount, { includeDecimals: false })}</strong>
            </div>
          </div>
        </div>

        <div className="bm-portal__cta">
          <button
            type="button"
            className="btn btn-lg"
            style={{ backgroundColor: color, color: "#FFFFFF", borderColor: color }}
            onClick={() => onProceedWithPersona(persona)}
          >
            <span>Continue as {persona.name.split(" ")[0]}</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bm-page">
      <a className="skip-link" href="#main">Skip to main content</a>

      {/* ------------------------------------------------------------ Nav -- */}
      {/* The open mobile menu always needs an opaque backing, even at scroll 0. */}
      <header className="bm-nav" data-stuck={stuck || mobileOpen}>
        <div className="container">
          <div className="bm-nav__inner">
            <button type="button" className="bm-brand" onClick={() => goToSection("top")}>
              <span className="bm-brand__mark">
                <Shield size={19} strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span style={{ textAlign: "left" }}>
                <span className="bm-brand__word">BEEMA</span>
                <span className="bm-brand__sub">Insurance &amp; claims</span>
              </span>
            </button>

            <nav className="bm-nav__links" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <button key={link.id} type="button" className="bm-nav__link" onClick={() => goToSection(link.id)}>
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="bm-nav__actions">
              <button type="button" className="btn btn-accent bm-nav__cta" onClick={() => goToSection("portals")}>
                Open your portal
              </button>
              <button
                type="button"
                className="bm-nav__toggle"
                aria-expanded={mobileOpen}
                aria-controls="bm-mobile-nav"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <nav id="bm-mobile-nav" className="bm-nav__mobile" hidden={!mobileOpen} aria-label="Primary (mobile)">
            {NAV_LINKS.map((link) => (
              <button key={link.id} type="button" className="bm-nav__link" onClick={() => goToSection(link.id)}>
                {link.label}
              </button>
            ))}
            <button type="button" className="btn btn-accent" style={{ marginTop: "8px" }} onClick={() => goToSection("portals")}>
              Open your portal
            </button>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* --------------------------------------------------------- Hero -- */}
        <section className="bm-hero" id="top">
          <div className="bm-aurora" aria-hidden="true">
            <span /><span /><span />
          </div>

          <div className="container">
            <div className="bm-hero__grid">
              <div>
                <p className="bm-eyebrow">
                  <span className="bm-eyebrow__pill">Beema</span>
                  Personal &amp; commercial cover, one platform
                </p>

                <h1 className="bm-hero__title">
                  Insurance that <em>makes sense</em> when you need it most.
                </h1>

                <p className="bm-hero__lede">
                  Compare cover in plain language, file a claim with the evidence you already have,
                  and follow every step to settlement. For individuals and for the teams managing
                  risk across an organisation.
                </p>

                <div className="bm-hero__cta">
                  <button type="button" className="btn btn-accent btn-lg" onClick={() => goToSection("cover")}>
                    <span>Explore cover</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                  <button type="button" className="btn btn-secondary btn-lg" onClick={() => goToSection("how")}>
                    How it works
                  </button>
                </div>

                <p className="bm-hero__note">
                  <Info size={15} style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
                  <span>
                    This is a working demonstration. Profiles, policies and claim amounts shown are
                    sample data — no real cover is sold or priced here.
                  </span>
                </p>
              </div>

              {/* Hero panel: layered glass over a representative claim view. */}
              <div className="bm-hero__panel">
                <div className="bm-float bm-float--tl glass" aria-hidden="true">
                  <ShieldCheck size={17} color="var(--color-success)" />
                  <span>Policy verified</span>
                </div>

                <div className="bm-panel glass glass-strong">
                  <div className="bm-panel__head">
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-light)" }}>
                        Claim status
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: 800, color: "var(--color-primary)", marginTop: "2px" }}>
                        CLM-VEH-2026-101
                      </div>
                    </div>
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} aria-hidden="true" />
                      Settled
                    </span>
                  </div>

                  <div className="bm-panel__row">
                    <span className="bm-panel__label">Cover</span>
                    <span className="bm-panel__value">Comprehensive motor</span>
                  </div>
                  <div className="bm-panel__row">
                    <span className="bm-panel__label">Claimed</span>
                    <span className="bm-panel__value">{formatRupees(185000, { includeDecimals: false })}</span>
                  </div>
                  <div className="bm-panel__row">
                    <span className="bm-panel__label">Assessment</span>
                    <span className="bm-panel__value" style={{ color: "var(--color-success)" }}>Fast-track</span>
                  </div>

                  <div className="bm-panel__steps">
                    {["Documents read and matched", "Damage assessed against estimate", "Approved for settlement"].map((step) => (
                      <div key={step} className="bm-panel__step">
                        <CheckCircle2 size={15} color="var(--color-success)" aria-hidden="true" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bm-float bm-float--br glass" aria-hidden="true">
                  <Clock size={17} color="var(--color-accent)" />
                  <span>Every stage timestamped</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ Portals -- */}
        <section className="section bm-portals" id="portals">
          <div className="container">
            <div className="reveal" style={{ maxWidth: "720px" }}>
              <p className="section-eyebrow">
                <User size={13} aria-hidden="true" />
                Choose your portal
              </p>
              <h2 className="section-title">Enter as an individual or an organisation.</h2>
              <p className="section-lede" style={{ marginBottom: "var(--space-5)" }}>
                The two portals share the same claim engine but differ in the cover they handle and the
                documentation a claim requires.
              </p>
              <p className="bm-disclaimer">
                <Info size={16} style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
                <span>
                  The profiles below are sample identities for exploring the platform. They are not real
                  customers, and the policies and amounts attached to them are demonstration data.
                </span>
              </p>
            </div>

            <div className="bm-portal-grid reveal">
              {renderPortal({
                segment: "individual",
                kicker: "Portal 01 · Personal",
                title: "Individual",
                description:
                  "For retail policyholders claiming on their own cover — vehicle damage, hospitalisation, home loss and travel disruption.",
                icon: User,
                color: "var(--color-accent)",
                tint: "var(--color-accent-subtle)",
                lines: individualLines,
                personas: SPOOFED_PERSONAS.individual,
                selectedId: selectedIndPersonaId,
                onSelect: setSelectedIndPersonaId,
                persona: selectedIndPersona,
              })}

              {renderPortal({
                segment: "organisation",
                kicker: "Portal 02 · Commercial",
                title: "Organisation",
                description:
                  "For risk and finance teams handling commercial exposure — captive programmes, fleet and cargo, and cyber liability.",
                icon: Building2,
                color: "var(--color-violet)",
                tint: "#F5F2FF",
                lines: organisationLines,
                personas: SPOOFED_PERSONAS.organisation,
                selectedId: selectedOrgPersonaId,
                onSelect: setSelectedOrgPersonaId,
                persona: selectedOrgPersona,
              })}
            </div>

            <div className="bm-unified card reveal">
              <div>
                <div style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-primary)" }}>
                  Need to see both portfolios at once?
                </div>
                <p style={{ fontSize: "var(--text-base)", marginTop: "2px" }}>
                  Open the combined ledger to review personal and commercial claims side by side.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  onProceedWithPersona({
                    id: "unified_admin",
                    name: "Unified Master Auditor",
                    segment: "all",
                    title: "Combined portfolio view",
                    identifier: "ALL-LINES",
                    avatarInitials: "UA",
                    avatarBg: "#0B2239",
                    defaultCategory: "vehicle_ind",
                  })
                }
              >
                <span>Open combined ledger</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- Products -- */}
        <section className="section" id="cover">
          <div className="container">
            <div className="reveal">
              <p className="section-eyebrow">
                <Layers size={13} aria-hidden="true" />
                What we cover
              </p>
              <h2 className="section-title">Cover for your life, and for your business.</h2>
              <p className="section-lede">
                Beema supports {INSURANCE_CATEGORIES.length} lines of cover across personal and
                commercial risk. Choose one to open the portal with that line already selected.
              </p>
            </div>

            <div className="bm-cat-grid reveal" style={{ marginTop: "var(--space-10)" }}>
              {INSURANCE_CATEGORIES.map((category) => {
                const Icon = ICON_MAP[category.icon] || Shield;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className="bm-cat"
                    style={{ "--cat-color": category.color, "--cat-tint": `${category.color}14` }}
                    onClick={() => enterWithCategory(category)}
                  >
                    <span className="bm-cat__icon">
                      <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
                    </span>

                    <span className="bm-cat__name">{category.name}</span>
                    <span className="bm-cat__desc">{category.shortDesc}</span>

                    <span className="bm-cat__types">
                      {(category.defaultTypes || []).slice(0, 2).map((type) => (
                        <span key={type} className="bm-chip">{type}</span>
                      ))}
                    </span>

                    <span className="bm-cat__go">
                      Open this cover
                      <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- Why Beema -- */}
        <section className="section bm-why" id="why">
          <div className="container">
            <div className="reveal">
              <p className="section-eyebrow">
                <Sparkles size={13} aria-hidden="true" />
                Why Beema
              </p>
              <h2 className="section-title">Built to remove the guesswork.</h2>
              <p className="section-lede">
                Most of the friction in insurance comes from not knowing where a claim stands or what
                a policy actually says. Beema is designed around both.
              </p>
            </div>

            <div className="bm-why__grid reveal">
              {BENEFITS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bm-why__item">
                  <span className="bm-why__icon">
                    <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <h3 className="bm-why__title">{title}</h3>
                  <p className="bm-why__body">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- How it works -- */}
        <section className="section" id="how">
          <div className="container">
            <div className="reveal">
              <p className="section-eyebrow">
                <Clock size={13} aria-hidden="true" />
                How it works
              </p>
              <h2 className="section-title">Four steps, start to settlement.</h2>
              <p className="section-lede">
                The same path whether you are claiming on a personal policy or managing a commercial loss.
              </p>
            </div>

            <ol className="bm-steps reveal">
              {STEPS.map((step, index) => (
                <li key={step.title} className="bm-step">
                  <span className="bm-step__num" aria-hidden="true">{index + 1}</span>
                  <h3 className="bm-step__title">{step.title}</h3>
                  <p className="bm-step__body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------- FAQ -- */}
        <section className="section bm-why" id="faq">
          <div className="container">
            <div className="reveal" style={{ textAlign: "center" }}>
              <p className="section-eyebrow" style={{ justifyContent: "center" }}>
                <MessageSquare size={13} aria-hidden="true" />
                Questions
              </p>
              <h2 className="section-title">Straight answers.</h2>
              <p className="section-lede" style={{ marginInline: "auto" }}>
                What Beema does, what it does not do, and the terms worth knowing before you claim.
              </p>
            </div>

            <div className="bm-faq reveal">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.q} className="bm-faq__item" data-open={isOpen}>
                    <h3>
                      <button
                        type="button"
                        className="bm-faq__q"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${index}`}
                        id={`faq-button-${index}`}
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className="bm-faq__icon" size={19} aria-hidden="true" />
                      </button>
                    </h3>
                    <div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-button-${index}`}
                      className="bm-faq__a"
                      hidden={!isOpen}
                    >
                      {faq.a}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* --------------------------------------------------------- Footer -- */}
      <footer className="bm-footer">
        <div className="container">
          <div className="bm-footer__grid">
            <div className="bm-footer__brand">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="bm-brand__mark">
                  <Shield size={19} strokeWidth={2.6} aria-hidden="true" />
                </span>
                <span className="bm-brand__word" style={{ color: "#FFFFFF" }}>BEEMA</span>
              </div>
              <p>
                An insurance claims platform for individual policyholders and organisations, covering
                policy comparison, claim filing, document verification and settlement tracking.
              </p>
            </div>

            <div className="bm-footer__col">
              <h4>Cover</h4>
              <ul>
                {INSURANCE_CATEGORIES.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <button type="button" onClick={() => enterWithCategory(category)}>
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bm-footer__col">
              <h4>Platform</h4>
              <ul>
                <li><button type="button" onClick={() => goToSection("why")}>Why Beema</button></li>
                <li><button type="button" onClick={() => goToSection("how")}>How it works</button></li>
                <li><button type="button" onClick={() => goToSection("portals")}>Portals</button></li>
                <li><button type="button" onClick={() => goToSection("faq")}>FAQ</button></li>
              </ul>
            </div>

            <div className="bm-footer__col">
              <h4>Support</h4>
              <ul>
                <li><button type="button" onClick={() => goToSection("faq")}>Common questions</button></li>
                <li><button type="button" onClick={() => goToSection("portals")}>Track a claim</button></li>
                <li><button type="button" onClick={() => goToSection("cover")}>Coverage &amp; exclusions</button></li>
              </ul>
            </div>
          </div>

          <div className="bm-footer__bar">
            <span>
              Beema — demonstration environment. Not a live insurance service; no cover is sold, priced or bound here.
            </span>
            <span>Amounts shown in Indian Rupees (₹).</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
