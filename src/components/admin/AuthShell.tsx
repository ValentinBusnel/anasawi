import { LogoMark } from '@/components/site/Logo'

/**
 * La porte d'entrée de l'administration — connexion, lien d'invitation.
 *
 * Le même langage que l'outil : un canevas neutre, une carte blanche au
 * centre, la marque au-dessus, un titre net et une phrase qui dit ce
 * qu'on attend. Rien d'autre à l'écran.
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
  /** Sous la carte : un lien de repli, une mention. */
  footer?: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#f6f6f4] px-5 py-12 font-sans text-[#191b1a]">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold tracking-[0.12em]">ANASAWI</span>
            <span className="block text-[12px] text-[#696a65]">Administration</span>
          </span>
        </div>

        <div className="rounded-[18px] border border-[#e9e9e6] bg-white p-7 shadow-[0_1px_3px_rgba(17,20,18,0.06),0_12px_32px_-16px_rgba(17,20,18,0.12)] sm:p-8">
          <h1 className="font-sans text-[22px] font-semibold leading-tight tracking-[-0.02em]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-[14px] leading-[1.55] text-[#696a65]">{description}</p>
          )}
          <div className="mt-7">{children}</div>
        </div>

        {footer && (
          <div className="mt-6 text-center text-[13.5px] text-[#696a65]">{footer}</div>
        )}
      </div>
    </main>
  )
}
