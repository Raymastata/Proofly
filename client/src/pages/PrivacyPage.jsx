/**

 * Proofly — Privacy Policy page.

 */

export function PrivacyPage() {

  return (

    <div className="space-y-10">

      <section className="mx-auto max-w-3xl">

        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">

          <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_0_4px_rgb(34_211_238_/_0.12)]" />

          Legal

        </div>

        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">

          Privacy Policy

        </h1>

        <p className="mt-4 text-sm text-slate-400">Last updated: {new Date().getFullYear()}</p>

      </section>



      <section className="mx-auto max-w-3xl rounded-3xl bg-slate-950/25 p-8 ring-1 ring-white/10">

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">

          <p>

            Proofly (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This

            policy explains what information is involved when you use our service, how we handle it, and the choices

            available to you.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Information we process</h2>

          <p>

            When you use Proofly, you may submit text, images, or other content for analysis. We process this content

            solely to operate the service and deliver results to you. We do not sell your personal information.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Analysis with Google Gemini</h2>

          <p>

            We use Google Gemini (via the Google Generative AI API) to run AI-assisted analysis and optional rewriting on

            submissions you send through Proofly. Content is transmitted to Google only as needed to perform those features,

            in line with this policy and applicable Google terms and privacy practices.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Storage and retention</h2>

          <p>

            We do not permanently store the text or images you submit for analysis as part of delivering Proofly. Content

            is handled transiently for processing and is not kept on our systems for long-term retention. We may retain

            limited technical or operational records (for example, aggregated or de-identified metrics, security logs, or

            data required for legal compliance) where necessary and proportionate.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">How we use information</h2>

          <p>

            We use processed information to provide and improve the service, maintain security, respond to support

            requests, and meet legal obligations. We take reasonable steps to limit access to information to those who need

            it to perform these functions.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Your choices and rights</h2>

          <p>

            Depending on where you live, you may have rights to access, correct, delete, or restrict certain personal

            information, or to object to certain processing. To exercise these rights or ask privacy-related questions,

            contact us using the information provided in the app or on our website.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Changes to this policy</h2>

          <p>

            We may update this Privacy Policy from time to time. When we do, we will revise the &quot;Last updated&quot;

            date above. Material changes may be communicated through the service or by other appropriate means.

          </p>



          <p className="pt-2 text-slate-400">

            This policy is provided for transparency. For regulated or high-stakes use cases, you may wish to have it

            reviewed by qualified legal counsel.

          </p>

        </div>

      </section>

    </div>

  );

}


