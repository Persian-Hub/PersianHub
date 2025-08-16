import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Premium - Persian Hub",
  description: "Premium features for Persian businesses",
}

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Premium</h1>
          <p className="text-muted-foreground mb-8">Premium features and services for Persian businesses</p>
          <div className="bg-muted/50 rounded-lg p-8">
            <p className="text-lg text-muted-foreground">
              Coming soon! Premium features to help your business stand out.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
