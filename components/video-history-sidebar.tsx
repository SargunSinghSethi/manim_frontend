"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getUserVideos, type Video } from "@/lib/api"
import { Loader2, Play, Calendar, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"


export function VideoHistorySidebar() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  const LIMIT = 10

  const loadVideos = useCallback(
    async (currentOffset: number, isInitial = false) => {
      if (loading) return

      setLoading(true)
      setError(null)

      try {
        const response = await getUserVideos(LIMIT, currentOffset)

        if (isInitial) {
          setVideos(response.videos)
        } else {
          setVideos((prev) => [...prev, ...response.videos])
        }

        setHasMore(response.pagination.hasMore)
        setOffset(currentOffset + LIMIT)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load videos"
        setError(errorMessage)
        toast.error("Error", {
          description: errorMessage,
        })
      } finally {
        setLoading(false)
      }
    },
    [loading],
  )

  // Initial load
  useEffect(() => {
    loadVideos(0, true)
  }, [])

  // Infinite scroll setup
  useEffect(() => {
    if (!hasMore || loading) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadVideos(offset)
        }
      },
      { threshold: 0.1 },
    )

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, offset, loadVideos])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleVideoClick = (video: Video) => {
    console.log("[v0] Video clicked:", video)
    toast.success("Video Selected", {
      description: `Opening: ${video.title}`,
    })
  }

  if (error && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Failed to load videos</p>
        </div>
        <Button onClick={() => loadVideos(0, true)} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    )
  }



  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">Video History</h3>
        <Button onClick={() => loadVideos(0, true)} variant="ghost" size="sm" className="h-8 w-8 p-0">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {videos.length === 0 && !loading ? (
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <Play className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No videos yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleVideoClick(video)}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium line-clamp-2 leading-tight">{video.title}</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{video.jobId.slice(0, 6)}...</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {hasMore && (
          <div ref={loadingRef} className="flex justify-center py-4">

            {loading && (
              <div className="space-y-2 p-2">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasMore && videos.length > 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">End of history</p>
          </div>
        )}
      </div>
    </div>
  )
}
