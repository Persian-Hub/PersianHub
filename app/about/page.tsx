import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "About Persian Hub - Find Persian Businesses",
  description:
    "Learn about Persian Hub, the community-driven directory helping people discover trusted Persian businesses across Australia.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Persian Hub</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find and support Persian-owned businesses near you.
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              Persian Hub is a community-driven directory that helps people discover trusted Persian businesses across
              Australia—on web and mobile.
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why we built it</h2>
              <p className="text-gray-600 leading-relaxed">
                Newcomers and long-time locals alike often ask the same questions: Where can I find a Persian grocer,
                mechanic, dentist, or café I can trust? We created Persian Hub to make those answers easy, reliable, and
                right where you are.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How Persian Hub works</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For visitors:</h3>
                  <p className="text-gray-600">
                    Browse by category, search by name or suburb, view listings on the map, and get directions or call
                    in one tap. "Near me" surfaces businesses closest to your current location.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For business owners:</h3>
                  <p className="text-gray-600">
                    Create a free account, add your business details, photos, and location, then track your listing
                    status as it moves from pending → approved. Update your profile anytime.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For the community:</h3>
                  <p className="text-gray-600">
                    See badges like Verified (identity & details checked) and Sponsored (featured placements). Flag
                    issues so our moderators can review quickly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trust & safety</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin approval:</h3>
                  <p className="text-gray-600">Every new or edited listing is reviewed before it goes live.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear reasons:</h3>
                  <p className="text-gray-600">If something is rejected, we share the reason and how to fix it.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reporting:</h3>
                  <p className="text-gray-600">See something wrong? Report it—our team investigates.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Content rules:</h3>
                  <p className="text-gray-600">We filter profanity and enforce image size/type guidelines.</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit trail:</h3>
                <p className="text-gray-600">
                  We log who created, edited, or approved listings to keep moderation transparent.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy first</h2>
              <p className="text-gray-600 leading-relaxed">
                We only collect what's needed to run the directory. Location is used for "near me" results with clear
                permission prompts. You can request data deletion at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What you'll find in each listing</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Name, category, and a friendly description</li>
                <li>• Address with map, phone, website, and opening hours</li>
                <li>• Photos that show the real experience</li>
                <li>• (Coming soon) Reviews & ratings, favorites, and business analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Roadmap</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">V1:</h3>
                  <p className="text-gray-600">
                    Reviews/ratings, favorites, featured/sponsored placements, notifications
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">V2:</h3>
                  <p className="text-gray-600">
                    Advanced filters, CSV import for admins, deeper verification workflows
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our story</h2>
              <p className="text-gray-600 leading-relaxed">
                Persian Hub is built in Brisbane by members of the Persian community who love good service, clear
                information, and helping small businesses grow. Founded by Arsalan Ahmadi, our goal is simple: make it
                effortless to find and support Persian businesses—wherever you are.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get involved</h2>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <strong>Own a business?</strong>{" "}
                  <a href="/dashboard/add-business" className="text-blue-600 hover:underline">
                    [Add your listing]
                  </a>
                </p>
                <p className="text-gray-600">
                  <strong>Know a great spot?</strong> Suggest it so we can invite them to join.
                </p>
                <p className="text-gray-600">
                  <strong>Feedback?</strong> We're listening—help us make Persian Hub better for everyone.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
