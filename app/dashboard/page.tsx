"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        router.push("/login")
        return
      }
      
      setUser(data.session.user)
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="text-xl font-bold">
            <span className="text-foreground">Curricu</span>
            <span className="text-primary">llm</span>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            You are signed in as {user?.email}
          </p>
          <div className="mt-8 grid gap-6">
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold">Your CV Collection</h2>
              <p className="mt-2 text-muted-foreground">
                You haven't uploaded any CVs yet. Get started by uploading your first CV.
              </p>
              <Button className="mt-4">Upload CV</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 