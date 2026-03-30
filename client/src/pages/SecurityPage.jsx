/**

 * Proofly — Security overview for customers and evaluators.

 */

export function SecurityPage() {

  return (

    <div className="space-y-10">

      <section className="mx-auto max-w-3xl">

        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">

          <span className="size-2 rounded-full bg-violet-400 shadow-[0_0_0_4px_rgb(167_139_250_/_0.12)]" />

          Trust

        </div>

        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">

          Security

        </h1>

        <p className="mt-4 text-sm text-slate-400">Overview for customers and evaluators</p>

      </section>



      <section className="mx-auto max-w-3xl rounded-3xl bg-slate-950/25 p-8 ring-1 ring-white/10">

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">

          <p>

            Proofly is designed so that sensitive content moves only over protected channels and is handled with

            practices appropriate to a cloud-backed analysis product. This page summarizes our posture at a high level; it

            is not an exhaustive security specification.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Encryption in transit</h2>

          <p>

            All data between your browser or client and Proofly is sent over <strong className="font-semibold text-slate-200">HTTPS</strong> using modern TLS. This encrypts traffic on the network so it cannot be read in clear text by

            typical eavesdroppers. You should ensure you always use official Proofly URLs and keep your devices and

            browsers up to date.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">API and provider connectivity</h2>

          <p>

            Our integration with Google Gemini uses <strong className="font-semibold text-slate-200">industry-standard API security</strong>: authenticated requests over TLS, protected API credentials, and least-privilege access where we control keys and tokens. We do not expose those credentials in client-side code intended for end users.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Operational security</h2>

          <p>

            We apply reasonable administrative and technical controls to run the service securely, including attention to

            dependency updates, access boundaries for production systems, and monitoring appropriate to our stage of

            maturity. Details may evolve as the product grows.

          </p>



          <h2 className="pt-2 text-base font-semibold text-white">Your role</h2>

          <p>

            Security is shared: use strong passwords, protect devices, and report suspected vulnerabilities or abuse

            through the contact channels we publish. For formal questionnaires, attestations, or incident response

            procedures for enterprise procurement, reach out—we can share what applies to your evaluation.

          </p>



          <p className="pt-2 text-slate-400">

            This overview describes intent and common practices; it does not replace a signed agreement, audit report, or

            vendor-specific security addendum where those are required.

          </p>

        </div>

      </section>

    </div>

  );

}


