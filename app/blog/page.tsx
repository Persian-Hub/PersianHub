import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Blog - Persian Hub",
  description: "Latest news and updates from Persian Hub",
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Blog</h1>
          <p className="text-muted-foreground mb-8">
            Latest news, updates, and stories from the Persian business community
          </p>
          <div className="bg-muted/50 rounded-lg p-8">
            <p className="text-lg text-muted-foreground">
              Coming soon! We'll be sharing stories and updates from our community.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
