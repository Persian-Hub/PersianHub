import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Help - Persian Hub",
  description: "Get help and support for Persian Hub",
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help & Support</h1>
          <p className="text-muted-foreground mb-8">Get help with using Persian Hub</p>
          <div className="bg-muted/50 rounded-lg p-8">
            <p className="text-lg text-muted-foreground">
              Coming soon! Comprehensive help documentation and support resources.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
