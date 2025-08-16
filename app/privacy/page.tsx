import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Privacy Policy - Persian Hub",
  description: "Privacy policy for Persian Hub - how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Effective date: 17 August 2025</p>

            <div className="space-y-8 text-gray-600">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1) Overview</h2>
                <p className="mb-4">
                  This Privacy Policy explains how Persian Hub collects, uses, discloses, and protects your personal
                  information. We comply with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
                  If you are in the EEA/UK, we also outline additional GDPR rights below.
                </p>
                <p className="mb-2">Controller: [Company legal name, e.g., Aussie Avatar Pty Ltd] (ABN [ABN]).</p>
                <p>Contact: [privacy@yourdomain] • [postal address]</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2) Information we collect</h2>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Information you provide</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    <strong>Account details:</strong> name, email, password (hashed), phone, preferred language (FA/EN).
                  </li>
                  <li>
                    <strong>Business details (for owners):</strong> business name, category, description, address,
                    phone, email, website, opening hours, images, proof documents where requested.
                  </li>
                  <li>
                    <strong>User content:</strong> reviews, comments, messages, flags/reports.
                  </li>
                  <li>
                    <strong>Support & comms:</strong> enquiries, feedback, and correspondence.
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Information we collect automatically</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    <strong>Location data:</strong> precise location (when you opt in) for "Near me" results; coarse
                    IP-based location otherwise.
                  </li>
                  <li>
                    <strong>Device & log data:</strong> IP address, device type, OS, app version, timestamps,
                    diagnostics, crash logs.
                  </li>
                  <li>
                    <strong>Usage data:</strong> pages/screens visited, search queries, clicks, and interactions.
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Information from third parties</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Auth providers:</strong> if you sign in with Google/Apple (name, email, profile image if you
                    allow).
                  </li>
                  <li>
                    <strong>Maps/Geocoding:</strong> address/place IDs and coordinates returned by providers.
                  </li>
                  <li>
                    <strong>Payment/Promo (future):</strong> limited data to process sponsored placements or promotions.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3) How we use your information</h2>
                <p className="mb-4">We use personal information to:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>provide and maintain the service (account creation, authentication, listings, search, maps);</li>
                  <li>process submissions, approvals, verification checks, and community reports;</li>
                  <li>show relevant results (including "near me") and measure distance to listings;</li>
                  <li>communicate service updates, moderation outcomes, and security alerts;</li>
                  <li>improve safety (fraud/spam prevention, rate limiting) and diagnose issues;</li>
                  <li>analyze usage to improve features and performance;</li>
                  <li>comply with legal obligations and enforce our Terms.</li>
                </ul>
                <p>
                  Where required, we rely on your consent (e.g., precise location, marketing communications). You can
                  withdraw consent at any time (see "Your choices").
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4) Legal bases for EEA/UK users (GDPR)</h2>
                <p>
                  Our processing is based on: contract (to provide the service), legitimate interests (to secure and
                  improve the service, prevent abuse), consent (location, marketing), and legal obligations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5) Sharing your information</h2>
                <p className="mb-4">We may share information with:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    <strong>Service providers/Processors:</strong> hosting, storage (e.g., Supabase), email/SMS,
                    analytics, crash reporting, content moderation, and customer support tools;
                  </li>
                  <li>
                    <strong>Mapping providers:</strong> e.g., Google Maps/Places to provide maps and geocoding;
                  </li>
                  <li>
                    <strong>Business owners:</strong> limited data (e.g., aggregated analytics or your public
                    review/username);
                  </li>
                  <li>
                    <strong>Authorities or third parties</strong> when required by law, to protect rights, or
                    investigate abuse;
                  </li>
                  <li>
                    <strong>Successors</strong> in a merger, acquisition, or asset transfer (with safeguards).
                  </li>
                </ul>
                <p>We do not sell personal information.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6) International transfers</h2>
                <p>
                  Our providers may store or process data outside Australia (e.g., EU or US). We take reasonable steps
                  to ensure recipients protect your information in line with the APPs and, where applicable, GDPR
                  transfer mechanisms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7) Retention</h2>
                <p className="mb-4">We keep personal information as long as needed for the purposes above:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    <strong>Account data:</strong> while your account is active (and for a reasonable period after
                    deletion for backups, dispute resolution, and legal compliance).
                  </li>
                  <li>
                    <strong>Listings & media:</strong> while published and for a reasonable archival period after
                    removal.
                  </li>
                  <li>
                    <strong>Audit logs & security records:</strong> typically 24–36 months (longer if legally required).
                  </li>
                </ul>
                <p>When no longer needed, we take reasonable steps to de-identify or delete data.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8) Security</h2>
                <p>
                  We use reasonable technical and organisational measures (encryption in transit, access controls,
                  logging, least-privilege, RLS on data, etc.). No method is 100% secure; please use a strong, unique
                  password and enable device security features.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9) Your choices & rights</h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    <strong>Location:</strong> You can enable/disable precise location in your device settings; "Near
                    me" works best with precise location enabled.
                  </li>
                  <li>
                    <strong>Marketing:</strong> You can opt out of non-essential emails via unsubscribe links.
                  </li>
                  <li>
                    <strong>Access & correction:</strong> You may request access to, or correction of, your personal
                    information.
                  </li>
                  <li>
                    <strong>Deletion:</strong> You may request deletion of your account and associated personal
                    information, subject to legal or operational retention needs (e.g., fraud prevention, disputes).
                  </li>
                  <li>
                    <strong>EEA/UK users:</strong> You may also have rights to object, restrict processing, data
                    portability, and lodge a complaint with your local supervisory authority.
                  </li>
                </ul>
                <p>Requests: [privacy@yourdomain]. We may need to verify your identity.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10) Cookies & similar technologies</h2>
                <p>
                  We use essential cookies and similar technologies to keep you signed in and secure the service. We may
                  also use analytics cookies to understand usage and improve features. You can manage cookies in your
                  browser/app settings; disabling some may limit functionality.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">11) Children</h2>
                <p>
                  Persian Hub is not directed to children under 16. If you believe a child has provided personal
                  information, contact us to remove it.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">12) Data breaches</h2>
                <p>
                  We assess suspected breaches promptly. If an eligible data breach occurs under Australia's Notifiable
                  Data Breaches scheme, we will notify affected individuals and the OAIC as required.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">13) Third-party sites & content</h2>
                <p>
                  Links to third-party websites or listings are provided for convenience. Their privacy practices are
                  their own; we encourage you to read their policies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">14) Changes to this Policy</h2>
                <p>
                  We may update this Policy to reflect changes to our practices or legal requirements. If changes are
                  material, we'll take reasonable steps to notify you (e.g., in-app notice). Your continued use means
                  you accept the updated Policy.
                </p>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500">Effective date: 17 August 2025</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
