'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselImage {
  id: string
  image: string
  title?: string
  link?: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  autoPlayInterval?: number
}

export default function ImageCarousel({ images, autoPlayInterval = 3000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState<boolean[]>([])

  useEffect(() => {
    setIsLoaded(new Array(images.length).fill(false))
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [images.length, autoPlayInterval])

  const handleImageLoad = (index: number) => {
    setIsLoaded((prev) => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
  }

  if (images.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-[60px] sm:pt-[72px] pb-2">
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-[60px] sm:pt-[72px] pb-2">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] overflow-hidden bg-gray-100 rounded-lg">
        {images.map((img, index) => (
          <div
            key={img.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {img.link ? (
              <a href={img.link} className="block w-full h-full">
                <Image
                  src={img.image}
                  alt={img.title || `Image ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    isLoaded[index] ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="100vw"
                  priority={index === 0}
                  onLoad={() => handleImageLoad(index)}
                />
              </a>
            ) : (
              <Image
                src={img.image}
                alt={img.title || `Image ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  isLoaded[index] ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="100vw"
                priority={index === 0}
                onLoad={() => handleImageLoad(index)}
              />
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white text-primary-600 hover:text-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white text-primary-600 hover:text-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {!isLoaded[currentIndex] && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
        )}
      </div>
    </div>
  )
}
