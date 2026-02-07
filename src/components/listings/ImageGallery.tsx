'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { ListingImage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: ListingImage[]
  className?: string
}

function ArrowButton({
  direction,
  onClick,
  className,
}: {
  direction: 'left' | 'right'
  onClick: (e: React.MouseEvent) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm',
        direction === 'left' ? 'left-3' : 'right-3',
        className
      )}
      aria-label={direction === 'left' ? 'Forrige billede' : 'Næste billede'}
    >
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        {direction === 'left' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        )}
      </svg>
    </button>
  )
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order)
  const total = sortedImages.length

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return
      setActiveIndex(((index % total) + total) % total)
    },
    [total]
  )

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, goNext, goPrev])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  // Empty state
  if (total === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 rounded-lg aspect-[16/9] text-gray-400 text-sm',
          className
        )}
      >
        Ingen billeder tilgængelige
      </div>
    )
  }

  const activeImage = sortedImages[activeIndex]

  return (
    <>
      <div className={cn('space-y-3', className)}>
        {/* Main image */}
        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={activeImage.url}
            alt={`Billede ${activeIndex + 1} af ${total}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />

          {/* Arrows */}
          {total > 1 && (
            <>
              <ArrowButton
                direction="left"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
              />
              <ArrowButton
                direction="right"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
              />
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
            {activeIndex + 1} / {total}
          </div>
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative flex-shrink-0 h-16 w-24 overflow-hidden rounded-md border-2 transition-colors',
                  index === activeIndex
                    ? 'border-green-700'
                    : 'border-transparent hover:border-gray-300'
                )}
              >
                <Image
                  src={image.url}
                  alt={`Miniature ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Luk"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Lightbox image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.url}
              alt={`Billede ${activeIndex + 1} af ${total}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Lightbox arrows */}
          {total > 1 && (
            <>
              <ArrowButton
                direction="left"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="left-4"
              />
              <ArrowButton
                direction="right"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="right-4"
              />
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {activeIndex + 1} / {total}
          </div>
        </div>
      )}
    </>
  )
}
