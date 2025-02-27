"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      setLoading(false)
    }

    checkSession()
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} loading={loading} />
      <main className="flex-1 flex items-center justify-center">
        <HeroSection onGetStarted={handleGetStarted} />
      </main>
    </div>
  )
}

function Header({ isAuthenticated, loading }: { isAuthenticated: boolean; loading: boolean }) {
  const router = useRouter()

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <header className="w-full py-6">
      <div className="container flex items-center justify-between">
        <div className="text-xl font-bold">
          <span className="text-foreground">Curricu</span>
          <span className="text-primary">llm</span>
        </div>

        <nav className="flex items-center gap-8">
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <a 
            href="#" 
            onClick={handleSignInClick}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {loading ? "..." : isAuthenticated ? "Dashboard" : "Sign In"}
          </a>
        </nav>
      </div>
    </header>
  )
}

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="w-full">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Bring Your CVs to Life!
          </h1>
          <p className="max-w-[700px] text-xl text-muted-foreground">Transform static resumes into <span className="text-primary font-medium">dynamic conversations</span> — discover hidden potential in your CV collection!</p>
          <Button
            size="lg"
            className="px-8 py-6 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105"
            onClick={onGetStarted}
          >
            Start Chatting Now!
          </Button>
        </div>
      </div>
    </section>
  )
}

