import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Categories - Persian Hub",
  description: "Browse Persian businesses by category",
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Categories</h1>
          <p className="text-muted-foreground mb-8">Browse Persian businesses by category</p>
          <div className="bg-muted/50 rounded-lg p-8">
            <p className="text-lg text-muted-foreground">
              Coming soon! We're working on organizing businesses by categories.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
