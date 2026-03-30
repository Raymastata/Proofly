/**
 * How Proofly processes input and what users should expect.
 */
export function HowItWorksPage() {
  return (
    <div className="page-enter space-y-14">
      <section className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
          <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_0_4px_rgb(34_211_238_/_0.12)]" />
          AI-assisted verification for busy readers
        </div>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Know what to trust <span className="text-cyan-200">before</span> you share
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
          Proofly runs your text through an AI-style pattern review (Google Gemini), with optional OCR when you upload a screenshot
          or photo.
        </p>
      </section>

      <section className="rounded-3xl bg-slate-950/25 p-8 ring-1 ring-white/10">
        <h2 className="text-lg font-semibold text-white">How Proofly thinks (today)</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
          <li>
            <span className="font-medium text-slate-200">1.</span> Normalize input (text vs. URL). URLs use simulated text in
            this MVP.
          </li>
          <li>
            <span className="font-medium text-slate-200">2.</span> Send the combined text to Gemini for a human-likeness score
            and short explanation, derived from stylistic pattern review.
          </li>
          <li>
            <span className="font-medium text-slate-200">3.</span> Persist the analysis so the UI can render highlights from
            stable offsets.
          </li>
        </ol>
      </section>
    </div>
  );
}
