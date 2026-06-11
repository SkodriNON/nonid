export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          Privacy Policy
        </h1>

        <p className="mb-6 text-zinc-300">
          Last Updated: June 2026
        </p>

        <p className="mb-6">
          NexusnΩn.ID respects your privacy and is committed to protecting
          your personal information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Information We Collect
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>Email address used for verification.</li>
          <li>Wallet addresses connected to the platform.</li>
          <li>Identity Capsule information stored on blockchain.</li>
          <li>Technical usage and security logs.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          How We Use Information
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>Identity verification.</li>
          <li>Account security and authentication.</li>
          <li>Platform functionality and fraud prevention.</li>
          <li>Communication related to your account.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Blockchain Data
        </h2>

        <p>
          Certain identity and ownership information may be recorded on public
          blockchain networks. Blockchain data is immutable and cannot generally
          be deleted once recorded.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Data Sharing
        </h2>

        <p>
          NexusnΩn.ID does not sell personal information to third parties.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Contact
        </h2>

        <p>
          Email: founder@skodrinon.com
        </p>
      </div>
    </main>
  );
}