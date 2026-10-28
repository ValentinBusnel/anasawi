import { LogoMark } from '@/components/site/Logo'

/**
 * La porte d'entrée de l'administration — connexion, lien d'invitation.
 *
 * Le même geste que l'espace de la candidature Qeeps : un fond blanc, une
 * lueur bleue très douce qui respire derrière, une carte translucide au
 * centre avec la marque, un titre, une phrase, le formulaire.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  /** Sous le formulaire : un lien de repli, une mention. */
  footer?: React.ReactNode
}) {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-white px-6 py-12 font-[family-name:var(--font-poppins)] text-[#164951]">
      {/* La lueur : deux halos flous, immobiles sous prefers-reduced-motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side_at_35%_45%,rgba(221,247,247,0.95),transparent),radial-gradient(closest-side_at_70%_60%,rgba(23,108,121,0.14),transparent)] blur-[30px] motion-safe:animate-[auth-float_10s_ease-in-out_infinite_alternate]"
      />

      <div className="field-on-white relative flex w-full max-w-[400px] flex-col gap-5 rounded-[28px] bg-white/85 p-9 motion-safe:animate-[adm-in_1.1s_cubic-bezier(0.02,0.45,0.56,1)_both] shadow-[0_0_0_1px_rgba(22,73,81,0.05),0_30px_80px_rgba(22,73,81,0.16)] backdrop-blur-[12px] max-sm:p-7">
        <p className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <span className="text-[22px] font-semibold tracking-[-0.02em]">
            Anasawi<span className="text-[#176c79]">.</span>
          </span>
        </p>

        <div>
          <h1 className="font-[family-name:var(--font-poppins)] text-[24px] font-semibold leading-tight tracking-[-0.02em]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-[15px] leading-[21px] text-[#6b8186]">{description}</p>
          )}
        </div>

        {children}

        {footer && <div className="text-center text-[13px] text-[#6b8186]">{footer}</div>}
      </div>
    </main>
  )
}
