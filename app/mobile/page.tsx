import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Mobile App - Persian Hub",
  description: "Download the Persian Hub mobile app",
}

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Mobile App</h1>
          <p className="text-muted-foreground mb-8">Download the Persian Hub mobile app for iOS and Android</p>
          <div className="bg-muted/50 rounded-lg p-8">
            <p className="text-lg text-muted-foreground">Coming soon! Our mobile app is in development.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
