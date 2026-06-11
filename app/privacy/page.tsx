export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl rounded-3xl border border-cyan-400/20 bg-white/5 p-8">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>

        <p className="mt-4 text-zinc-400">Last updated: June 2026</p>

        <p className="mt-8 text-zinc-200">
          nΩn.ID is a sovereign digital identity application developed by SkodriNON.
          This Privacy Policy explains how we collect, use and protect information
          when users access nΩn.ID services.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Information We Collect</h2>
        <p className="mt-3 text-zinc-300">
          We may collect information such as email address, wallet address,
          identity verification status, Capsule Identity references, technical logs,
          device information and security-related activity.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">How We Use Information</h2>
        <p className="mt-3 text-zinc-300">
          Information is used to provide identity services, authentication,
          account security, fraud prevention, Capsule access, user support and
          platform functionality.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Blockchain Data</h2>
        <p className="mt-3 text-zinc-300">
          Some identity and ownership records may be stored or referenced on public
          blockchain networks. Blockchain transactions are public and may be
          immutable. nΩn.ID cannot delete data that has already been recorded on a
          public blockchain.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Data Sharing</h2>
        <p className="mt-3 text-zinc-300">
          We do not sell personal information. Data may be shared only when required
          to operate the service, comply with legal obligations, prevent fraud or
          protect users and the platform.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Data Security</h2>
        <p className="mt-3 text-zinc-300">
          We use technical and organizational measures to protect user information.
          However, no digital system can be guaranteed to be completely secure.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">User Rights</h2>
        <p className="mt-3 text-zinc-300">
          Users may contact us to request access, correction or deletion of personal
          information where legally and technically possible.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Contact</h2>
        <p className="mt-3 text-zinc-300">
          For privacy questions, contact us at founder@skodrinon.com.
        </p>
      </section>
    </main>
  );
}
