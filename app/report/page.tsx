import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Report - Persian Hub",
  description: "Report issues or inappropriate content",
}

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Report</h1>
          <p className="text-muted-foreground mb-8">Report issues or inappropriate content</p>
          <div className="bg-muted/50 rounded-lg p-8">
            <p className="text-lg text-muted-foreground">
              Coming soon! A form to report issues or inappropriate content.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
