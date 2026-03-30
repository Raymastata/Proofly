/**
 * Product capabilities and positioning.
 */
export function ProductPage() {
  return (
    <div className="page-enter space-y-14">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Built for readers who need signal, not noise
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
          Proofly highlights credibility cues and AI-style patterns so you can decide what deserves your trust.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Evidence-first signals',
            body: 'Surfaces missing attribution, hype language, and urgency tricks—then balances with structural trust cues.',
          },
          {
            title: 'Explainable scoring',
            body: 'You get a 0–100 score plus plain-language reasoning—not a black box confidence meter.',
          },
          {
            title: 'Built for sharing',
            body: 'Every run is stored with an ID so you can revisit results or drop a link in a thread (coming soon).',
          },
        ].map((x) => (
          <div key={x.title} className="rounded-3xl bg-white/[0.03] p-6 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">{x.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{x.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
