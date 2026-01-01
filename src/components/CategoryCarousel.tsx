'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  image?: string
}

interface CategoryCarouselProps {
  categories: Category[]
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  
  // Items visible at once (responsive)
  const [itemsPerView, setItemsPerView] = useState(6)
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(4)
      else if (window.innerWidth < 1024) setItemsPerView(5)
      else setItemsPerView(6)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || categories.length <= itemsPerView) return
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, categories.length - itemsPerView + 1))
    }, 3000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, categories.length, itemsPerView])
  
  // Scroll to index
  useEffect(() => {
    if (!scrollRef.current) return
    const itemWidth = scrollRef.current.scrollWidth / categories.length
    scrollRef.current.scrollTo({
      left: currentIndex * itemWidth,
      behavior: 'smooth'
    })
  }, [currentIndex, categories.length])
  
  const handlePrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }
  
  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(prev => 
      Math.min(prev + 1, Math.max(0, categories.length - itemsPerView))
    )
  }
  
  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsAutoPlaying(false)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
  }
  
  if (categories.length === 0) return null
  
  const canScrollPrev = currentIndex > 0
  const canScrollNext = currentIndex < categories.length - itemsPerView
  
  return (
    <section className="py-3 sm:py-4 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative">
          {/* Navigation buttons */}
          {categories.length > itemsPerView && (
            <>
              <button
                onClick={handlePrev}
                disabled={!canScrollPrev}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-lg transition-all ${
                  canScrollPrev
                    ? 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-110'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canScrollNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-lg transition-all ${
                  canScrollNext
                    ? 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-110'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                }`}
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          
          {/* Categories container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-hidden scroll-smooth"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="flex-shrink-0 group"
                style={{ width: `calc((100% - ${(itemsPerView - 1) * 12}px) / ${itemsPerView})` }}
              >
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
                  <div className="aspect-square relative overflow-hidden">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 sm:p-2 text-center">
                    <h3 className="text-[10px] sm:text-sm font-medium text-gray-800 truncate">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Dots indicator */}
          {categories.length > itemsPerView && (
            <div className="flex justify-center gap-1 mt-3">
              {Array.from({ length: Math.ceil(categories.length - itemsPerView + 1) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i)
                    setIsAutoPlaying(false)
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === i
                      ? 'w-6 bg-primary-600'
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
