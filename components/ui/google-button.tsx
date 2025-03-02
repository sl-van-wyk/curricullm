"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

interface GoogleButtonProps {
  mode: "signin" | "signup"
  className?: string
  onError?: (error: string) => void
}

export function GoogleButton({ 
  mode, 
  className,
  onError 
}: GoogleButtonProps) {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        throw error
      }
      
      // The redirect will happen automatically by Supabase
    } catch (error: any) {
      if (onError) {
        onError(error.message || "An error occurred during Google authentication")
      }
      console.error("Google auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={handleGoogleAuth}
      disabled={isLoading}
    >
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
        </>
      )}
    </Button>
  )
} 