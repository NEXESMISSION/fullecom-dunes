'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import { Product } from '@/types'

interface ProductSliderProps {
  title: string
  subtitle?: string
  products: Product[]
  sideImage?: string
  topImage?: string
  backgroundColor?: string
}

export default function ProductSlider({
  title,
  subtitle,
  products,
  sideImage,
  topImage,
  backgroundColor = 'bg-white'
}: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }

    // Initial check after render
    updateScrollState()
    const timer = setTimeout(updateScrollState, 200)

    container.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      clearTimeout(timer)
      container.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return
    
    const scrollAmount = container.clientWidth * 0.75
    const newPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className={`py-6 sm:py-8 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-8">
        {/* Mobile: Top Banner Image */}
        {topImage && (
          <div className="md:hidden mb-3 overflow-hidden">
            <img 
              src={topImage} 
              alt={title}
              className="w-full h-20 object-cover"
            />
          </div>
        )}
        
        {/* Title and arrows - always above products */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          
          {/* Arrow controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2.5 rounded-full transition-all duration-200 shadow-md ${
                canScrollLeft 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-110 hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2.5 rounded-full transition-all duration-200 shadow-md ${
                canScrollRight 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-110 hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Layout with optional side image */}
        <div className="flex gap-3 items-stretch">
          {/* Desktop: Side Image - Wider */}
          {sideImage && (
            <div className="hidden md:flex flex-shrink-0 w-56 lg:w-64 xl:w-72">
              <div className="w-full overflow-hidden bg-gray-100 relative">
                <img 
                  src={sideImage} 
                  alt={title}
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-bold text-lg">{title}</p>
                  {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Products Slider Container */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide h-full items-stretch"
            >
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-36 sm:w-40 lg:w-48"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
