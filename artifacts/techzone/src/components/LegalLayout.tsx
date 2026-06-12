import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalLayoutProps {
  title: string;
  code: string;
  intro: string;
  sections: LegalSection[];
  metaDescription: string;
}

export function LegalLayout({ title, code, intro, sections, metaDescription }: LegalLayoutProps) {
  return (
    <Layout>
      <Helmet>
        <title>{`${title} | Nexus Store`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${title} | Nexus Store`} />
        <meta property="og:description" content={metaDescription} />
      </Helmet>

      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-sm text-primary font-mono mb-4">
            <Link href="/" className="hover:text-secondary transition-colors uppercase">ROOT</Link>
            <span>/</span>
            <span className="text-foreground truncate uppercase">{code}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black neon-text text-primary uppercase flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 shrink-0" />
            {title}
          </h1>
          <p className="mt-4 text-primary/70 font-mono text-sm max-w-2xl leading-relaxed">
            {"// "}{intro}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-8">
          {sections.map((section, i) => (
            <section key={i} className="glass-panel clip-corner border-primary/20 p-6">
              <h2 className="text-xl font-bold text-primary neon-text mb-3 flex items-center gap-2">
                <span className="text-primary/40 font-mono text-sm">{String(i + 1).padStart(2, "0")}</span>
                {section.heading}
              </h2>
              <div className="text-foreground/80 leading-relaxed text-sm md:text-base space-y-3">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-primary/15 text-xs font-mono text-primary/50 text-center">
          {"//"} آخر تحديث: {new Date().toLocaleDateString("ar-EG")} — NEXUS_OS LEGAL_MODULE
        </div>
      </div>
    </Layout>
  );
}
