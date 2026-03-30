/**

 * Proofly — Terms of Service page.

 */

export function TermsPage() {

  return (

    <div className="space-y-10">

      <section className="mx-auto max-w-3xl">

        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">

          <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_0_4px_rgb(34_211_238_/_0.12)]" />

          Legal

        </div>

        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">

          Terms of Service

        </h1>

        <p className="mt-4 text-sm text-slate-400">Last updated: {new Date().getFullYear()}</p>

      </section>



      <section className="mx-auto max-w-3xl rounded-3xl bg-slate-950/25 p-8 ring-1 ring-white/10">

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">

          <p>

            Welcome to Proofly. By accessing or using our service, you agree to these Terms of Service. If you do not

            agree, please do not use Proofly.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">The service</h2>

          <p>

            Proofly provides tools that analyze content you submit (such as text or images) and present outputs that may

            include labels, scores, or other machine-assisted assessments. Features may change over time. We may suspend or

            modify the service with reasonable notice where practicable.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">AI outputs are estimates, not guarantees</h2>

          <p>

            Results from Proofly—including any indication of AI-generated or human-authored content—are <strong className="font-semibold text-slate-200">estimates</strong> produced by statistical models. They are <strong className="font-semibold text-slate-200">not</strong> a guarantee of accuracy, completeness, or fitness for any particular purpose. Models can be wrong, uncertain, or biased; outputs may vary with input format, language, or other factors.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Your responsibility</h2>

          <p>

            You are responsible for how you interpret and use Proofly&apos;s results. You must not rely on outputs as the

            sole basis for legal, medical, financial, employment, academic integrity, or other high-stakes decisions unless

            you apply appropriate human judgment and, where required, independent verification. You agree not to use the

            service in violation of law or third-party rights, including to harass, deceive, or infringe intellectual

            property.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Your account and acceptable use</h2>

          <p>

            You are responsible for activity under your account and for keeping credentials secure. You must not probe,

            disrupt, or overload the service; attempt unauthorized access; or reverse engineer except where applicable law

            permits.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Intellectual property</h2>

          <p>

            Proofly and its branding, software, and content (excluding your submissions) are owned by us or our licensors.

            You retain ownership of content you submit; you grant us the rights necessary to operate the service, including

            processing submissions through our providers (such as Google Gemini) as described in our Privacy Policy.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Disclaimers and limitation of liability</h2>

          <p>

            The service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind, to the

            fullest extent permitted by law. To the maximum extent permitted by law, Proofly and its suppliers will not be

            liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or

            goodwill. Our aggregate liability for claims relating to the service is limited to the greater of amounts you

            paid us in the twelve months before the claim or fifty U.S. dollars, except where law does not allow such a

            cap.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Indemnity</h2>

          <p>

            You will defend and indemnify Proofly against claims arising from your misuse of the service, your content, or

            your violation of these terms, subject to applicable law.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Governing law and disputes</h2>

          <p>

            These terms are governed by the laws of the jurisdiction designated in your agreement with us, or where none

            is stated, by the laws applicable to Proofly&apos;s operating entity, excluding conflict-of-law rules. Courts

            in that jurisdiction have exclusive venue, unless mandatory consumer protections in your region require

            otherwise.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Changes</h2>

          <p>

            We may update these Terms of Service. We will post the revised terms and update the &quot;Last updated&quot;

            date. Continued use after changes constitutes acceptance where permitted by law. If you do not agree, stop

            using the service.

          </p>



          <p className="pt-2 text-slate-400">

            These terms are a general template. Have qualified counsel review them before relying on them for production

            use or enterprise customers.

          </p>

        </div>

      </section>

    </div>

  );

}


