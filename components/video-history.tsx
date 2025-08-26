"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getUserVideos, type Video } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Play, Calendar } from "lucide-react"
import { toast } from "sonner"

export function VideoHistory() {
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
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleVideoClick = (video: Video) => {
        // Navigate to video or open video player
        console.log("[v0] Video clicked:", video)
        toast.success("Video Selected", {
            description: `Opening: ${video.title}`,
        })
    }

    if (error && videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">Failed to load videos</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={() => loadVideos(0, true)} variant="outline">
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Video History</h2>
                <Button onClick={() => loadVideos(0, true)} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            {videos.length === 0 && !loading ? (
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No videos yet</h3>
                    <p className="text-muted-foreground">Create your first animation to see it here!</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                        <Card
                            key={video.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleVideoClick(video)}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center text-sm text-muted-foreground space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(video.createdAt)}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Job ID: {video.jobId.slice(0, 8)}...</span>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <Play className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Loading indicator for infinite scroll */}
            {hasMore && (
                <div ref={loadingRef} className="flex justify-center py-8">
                    {loading && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading more videos...</span>
                        </div>
                    )}
                </div>
            )}

            {!hasMore && videos.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>You've reached the end of your video history</p>
                </div>
            )}
        </div>
    )
}
