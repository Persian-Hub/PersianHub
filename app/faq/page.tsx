import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "FAQ - Persian Hub",
  description: "Frequently asked questions about Persian Hub",
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">FAQ</h1>
          <p className="text-muted-foreground mb-8">Frequently asked questions about our platform.</p>
          <div className="bg-muted/50 rounded-lg p-8">
            <p className="text-lg text-muted-foreground">
              Coming soon! Answers to common questions about our platform.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
