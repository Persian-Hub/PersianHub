import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms & Conditions - Persian Hub",
  description: "Terms and conditions for using Persian Hub, the Persian business directory platform.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-gray-600 mb-8">Effective date: 17 August 2025</p>

            <div className="space-y-8 text-gray-600">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1) Who we are</h2>
                <p className="mb-4">
                  Persian Hub is an online directory (web and mobile apps) that helps people discover Persian-owned
                  businesses. The service is operated by [Company legal name, e.g., Aussie Avatar Pty Ltd] (ABN [ABN])
                  ("Persian Hub", "we", "us", "our").
                </p>
                <p>Contact: [contact email] • [postal address]</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2) Agreement to these Terms</h2>
                <p>
                  By accessing or using Persian Hub, you agree to these Terms & Conditions ("Terms"). If you do not
                  agree, do not use the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3) Eligibility & accounts</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You must be at least 16 years old (or the age of digital consent in your region) to use the service.
                  </li>
                  <li>You're responsible for your account and keeping your login credentials secure.</li>
                  <li>
                    Business owners warrant they have authority to represent and submit information for their business.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4) Our service (what we do—and don't)</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We provide a directory and discovery platform, with location features ("Near me"), search, maps, and
                    an admin review process.
                  </li>
                  <li>
                    We do not endorse or guarantee any listed business. Information may be provided by third parties and
                    may change.
                  </li>
                  <li>
                    Distances and map pins are estimates and may be imprecise due to GPS or geocoding limitations.
                  </li>
                  <li>
                    "Verified" indicates we have performed limited checks on identity/details at a point in time. It is
                    not a guarantee of quality, licensing, or ongoing compliance.
                  </li>
                  <li>
                    "Sponsored" or "Featured" labels indicate paid or promotional placement and may influence ranking.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5) Your content & licence</h2>
                <p className="mb-4">
                  "User Content" includes text, photos, logos, reviews, and business information you submit. You:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    warrant you own or have rights to share it, and that it is accurate, lawful, and not misleading;
                  </li>
                  <li>
                    grant Persian Hub a worldwide, non-exclusive, royalty-free licence to host, store, reproduce, adapt,
                    publish, translate, and display the content for operating, marketing, and improving the service
                    (including derivative works like thumbnails or translations);
                  </li>
                  <li>
                    retain all ownership in your content; you can delete it, but cached or backup copies may remain for
                    a limited time. We may keep content as required by law or to enforce these Terms.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6) Business owner responsibilities</h2>
                <p className="mb-4">If you add or manage a listing, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    provide accurate, up-to-date details (contact info, opening hours, licensing where applicable);
                  </li>
                  <li>promptly update material changes;</li>
                  <li>only upload images you have rights to use (no stock used against licence terms);</li>
                  <li>comply with consumer law, advertising rules, and any industry-specific requirements;</li>
                  <li>honor promotions and pricing you advertise.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7) Reviews & community guidelines</h2>
                <p className="mb-4">
                  When available, reviews must be genuine first-hand experiences. The following are prohibited:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>fake, incentivised, or conflict-of-interest reviews;</li>
                  <li>defamatory, hateful, harassing, obscene, or illegal content;</li>
                  <li>doxxing, impersonation, or privacy violations;</li>
                  <li>malware, scraping, or attempts to bypass security.</li>
                </ul>
                <p>We may moderate, edit, or remove content at our discretion and without notice.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8) Approval & moderation</h2>
                <p>
                  New and edited listings are "pending" until reviewed. We may approve, reject (with reasons), or
                  request changes. We can remove or suspend listings, accounts, or content at any time if we believe
                  these Terms or our policies are breached, or to protect users.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9) Third-party services</h2>
                <p>
                  We use third parties such as mapping and geocoding providers (e.g., Google Maps/Places), hosting,
                  storage, analytics, email/SMS, and authentication services (e.g., Supabase). Your use of map features
                  is also subject to those providers' terms and privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10) Intellectual property</h2>
                <p>
                  The Persian Hub platform, trademarks, design, and code are our intellectual property or used under
                  licence. You may not copy, modify, reverse engineer, or exploit the service except as allowed by law
                  or these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">11) Acceptable use</h2>
                <p className="mb-4">You must not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>misuse the service, interfere with security, or attempt to access non-public features;</li>
                  <li>scrape, harvest, or bulk-download without written permission;</li>
                  <li>submit spam, fraudulent listings, or unlawful content;</li>
                  <li>use the service for high-risk activities or emergency communications.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">12) Fees</h2>
                <p>
                  Core directory access is currently free. We may add paid features (e.g., sponsored placements) in
                  future with separate terms or notices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">13) Availability & changes</h2>
                <p>
                  We aim for high availability but do not guarantee uninterrupted access. We may change or discontinue
                  features, or update these Terms. If changes are material, we'll take reasonable steps to notify you.
                  Continued use means you accept the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">14) Australian Consumer Law</h2>
                <p className="mb-4">
                  Nothing in these Terms excludes, restricts, or modifies any non-excludable consumer guarantees under
                  the Australian Consumer Law (ACL). Where permitted by law and excluding the ACL guarantees:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>the service is provided "as is" and "as available";</li>
                  <li>we exclude all implied warranties;</li>
                  <li>
                    to the extent permitted, our aggregate liability for claims relating to the service is limited to
                    AUD $100 or the amount you paid to us in the 12 months before the claim, whichever is greater.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">15) Indemnity</h2>
                <p>
                  You indemnify us and our personnel against claims, losses, and costs arising from your use of the
                  service, your User Content, or your breach of these Terms or the law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">16) Termination</h2>
                <p>
                  You may stop using the service at any time. We may suspend or terminate access if you breach these
                  Terms or for operational/security reasons. Clauses intended to survive termination (e.g., IP,
                  disclaimers, liability limits, indemnities) survive.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">17) Governing law & disputes</h2>
                <p>
                  These Terms are governed by the laws of Queensland, Australia. You submit to the exclusive
                  jurisdiction of the courts of Queensland and the Commonwealth of Australia.
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
