import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Persian Hub</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connecting communities with authentic Persian businesses across Australia
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                Persian Hub is dedicated to supporting and promoting Persian-owned businesses throughout Australia. We
                believe in the power of community and aim to create a platform where Persian entrepreneurs can showcase
                their services while helping customers discover authentic Persian businesses in their area.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For Business Owners</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Free business listing and profile creation</li>
                    <li>• Customer review and rating system</li>
                    <li>• Business analytics and insights</li>
                    <li>• Verification badges for trusted businesses</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For Customers</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Easy search and discovery of Persian businesses</li>
                    <li>• Location-based results and directions</li>
                    <li>• Authentic reviews from the community</li>
                    <li>• Direct contact with business owners</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
                  <p className="text-gray-600">Building stronger connections within the Persian community</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Authenticity</h3>
                  <p className="text-gray-600">Promoting genuine Persian businesses and services</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust</h3>
                  <p className="text-gray-600">Ensuring quality through verification and community reviews</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
