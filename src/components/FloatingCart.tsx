'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function FloatingCart() {
  const { getCartCount, setIsCartOpen } = useCart()
  const [animate, setAnimate] = useState(false)
  const [prevCount, setPrevCount] = useState(0)
  const count = getCartCount()

  // Animate when count increases
  useEffect(() => {
    if (count > prevCount) {
      setAnimate(true)
      const timer = setTimeout(() => setAnimate(false), 500)
      return () => clearTimeout(timer)
    }
    setPrevCount(count)
  }, [count, prevCount])

  if (count === 0) return null

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className={`fixed top-4 left-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
        animate 
          ? 'bg-primary-600 text-white scale-110' 
          : 'bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white'
      }`}
      style={{ 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="relative">
        <ShoppingCart className={`h-5 w-5 ${animate ? 'animate-bounce' : ''}`} />
        <span 
          className={`absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold rounded-full px-1 ${
            animate 
              ? 'bg-white text-primary-600' 
              : 'bg-primary-600 text-white'
          }`}
        >
          {count}
        </span>
      </div>
      <span className="font-medium text-sm hidden sm:inline">
        {animate ? 'Added!' : 'Cart'}
      </span>
    </button>
  )
}
