import type { LucideIcon } from "lucide-react";

/** Uniform glass section card for the settings page. */
export default function SettingsSection({
  id,
  icon: Icon,
  tint,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: LucideIcon;
  tint: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="glass scroll-mt-28 p-6 sm:p-7" aria-labelledby={`${id}-heading`}>
      <div className="flex items-start gap-4 border-b border-white/5 pb-5">
        <div className={`icon-tile ${tint}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id={`${id}-heading`} className="text-lg font-extrabold text-white">{title}</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-mist-dim">{subtitle}</p>
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}
