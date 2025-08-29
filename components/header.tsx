"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { History } from "lucide-react";

export function Header() {
  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M12 3a9 9 0 1 0 9 9" />
              <path d="M12 3v9l9 9" />
              <path d="M3 3v18h18" />
            </svg>
            <span className="font-bold text-xl">Manim AI</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn && (
            <Link
  href="/history"
  aria-label="Open video history"
  className="group"
>
  <Button
    variant="ghost"
    size="sm"
    className="flex items-center gap-2 px-3 py-2 transition-all duration-200 hover:bg-muted hover:shadow-sm hover:scale-[1.03] active:scale-[0.97]"
  >
    <History
      className="h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary"
      aria-hidden="true"
    />
    <span className="hidden sm:inline text-sm font-medium">Video History</span>
    {/* Tooltip-like label for mobile */}
    <span className="sm:hidden absolute left-full ml-2 text-xs bg-popover text-popover-foreground px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
      Video History
    </span>
  </Button>
</Link>

          )}
          <ModeToggle />
          {/* Conditional Auth Buttons */}
          {!isLoaded ? (
            // Loading state
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : isSignedIn ? (
            // Signed in state
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome, {user.firstName || user.username || 'User'}
              </span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          ) : (
            // Not signed in state
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
