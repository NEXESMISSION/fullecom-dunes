'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Menu, X, Store } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [badgeAnimate, setBadgeAnimate] = useState(false)
  const { getCartCount, setIsCartOpen } = useCart()
  const cartCount = getCartCount()
  const prevCountRef = useRef(cartCount)

  // Animate badge when cart count increases
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setBadgeAnimate(true)
      const timer = setTimeout(() => setBadgeAnimate(false), 600)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = cartCount
  }, [cartCount])

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'المنتجات' },
    { href: '/cart', label: 'السلة' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">متجرنا</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="فتح السلة"
            >
              <ShoppingCart className={`h-6 w-6 transition-transform ${badgeAnimate ? 'scale-110' : ''}`} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 ${
                  badgeAnimate 
                    ? 'bg-green-500 scale-125 animate-pulse' 
                    : 'bg-primary-600'
                }`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
