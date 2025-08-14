import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

            <div className="space-y-8 text-gray-600">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Persian Hub, you accept and agree to be bound by the terms and provision of
                  this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Business Listings</h2>
                <p className="mb-4">
                  Business owners are responsible for the accuracy of their listing information. Persian Hub reserves
                  the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Review and approve all business listings before publication</li>
                  <li>Remove or modify listings that violate our guidelines</li>
                  <li>Verify business information and request documentation</li>
                  <li>Suspend or terminate accounts for policy violations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Reviews</h2>
                <p className="mb-4">Users may submit reviews and ratings for businesses. All reviews must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be based on genuine experiences with the business</li>
                  <li>Be respectful and constructive</li>
                  <li>Not contain offensive, discriminatory, or inappropriate content</li>
                  <li>Not violate any laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Privacy Policy</h2>
                <p>
                  We are committed to protecting your privacy. Personal information collected through Persian Hub is
                  used solely for platform functionality and will not be shared with third parties without consent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
                <p>
                  Persian Hub acts as a platform connecting businesses with customers. We are not responsible for the
                  quality of services provided by listed businesses or any disputes between users and businesses.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Changes to Terms</h2>
                <p>
                  Persian Hub reserves the right to modify these terms at any time. Users will be notified of
                  significant changes, and continued use of the platform constitutes acceptance of updated terms.
                </p>
              </section>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
