import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <HeroSection />
      </main>
    </div>
  )
}

function Header() {
  return (
    <header className="w-full py-6">
      <div className="container flex items-center justify-between">
        <div className="text-xl font-bold">
          <span className="text-yellow-400">Curricullm</span>
        </div>

        <nav className="flex items-center gap-8">
          <Link href="#" className="text-sm font-medium hover:text-yellow-400 transition-colors">
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-yellow-400 transition-colors">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="w-full">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Simplify your learning journey
          </h1>
          <p className="max-w-[600px] text-xl text-zinc-400">One platform. Unlimited possibilities.</p>
          <Button
            size="lg"
            className="px-8 py-6 text-lg bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  )
}

