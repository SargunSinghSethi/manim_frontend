"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VideoHistorySidebar } from "./video-history-sidebar"
import { History, X } from "lucide-react"

interface ToggleableSidebarProps {
  className?: string
}

export function ToggleableSidebar({ className }: ToggleableSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar - Fixed positioning when open */}
      {isOpen && (
        <div className="hidden lg:block fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-40 shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Video History</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <VideoHistorySidebar />
        </div>
      )}

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur">
              <History className="h-4 w-4" />
              <span className="sr-only">Open video history</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Video History</SheetTitle>
            </SheetHeader>
            <VideoHistorySidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Toggle Button */}
      <div className="hidden lg:block">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur"
        >
          <History className="h-4 w-4" />
          <span className="sr-only">Toggle video history</span>
        </Button>
      </div>

      {/* Overlay for desktop when sidebar is open */}
      {isOpen && <div className="hidden lg:block fixed inset-0 bg-black/20 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
