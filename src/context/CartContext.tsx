'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { CartItem, ProductOptions } from '@/types'
import toast from 'react-hot-toast'

// Generate a unique key for cart items based on product ID and options
export function generateOptionsKey(productId: string, options?: ProductOptions): string {
  if (!options || Object.keys(options).length === 0) {
    return productId
  }
  const sortedOptions = Object.keys(options)
    .sort()
    .map(key => `${key}:${options[key]}`)
    .join('|')
  return `${productId}_${sortedOptions}`
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity' | 'optionsKey'>, quantity?: number) => void
  removeFromCart: (optionsKey: string) => void
  updateQuantity: (optionsKey: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'ecommerce_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        // Migrate old cart items without options
        const migrated = parsed.map((item: CartItem) => ({
          ...item,
          options: item.options || {},
          optionsKey: item.optionsKey || generateOptionsKey(item.product_id, item.options || {})
        }))
        setItems(migrated)
      } catch (e) {
        console.error('Failed to parse cart from localStorage')
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity' | 'optionsKey'>, quantity = 1) => {
    const options = item.options || {}
    const optionsKey = generateOptionsKey(item.product_id, options)
    
    setItems(currentItems => {
      // Find item with same product AND same options
      const existingItem = currentItems.find(i => i.optionsKey === optionsKey)
      
      if (existingItem) {
        return currentItems.map(i =>
          i.optionsKey === optionsKey
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      
      return [...currentItems, { ...item, options, quantity, optionsKey }]
    })
    // Badge indicator on cart icon shows feedback - no popup needed
  }, [])

  const removeFromCart = useCallback((optionsKey: string) => {
    setItems(currentItems => currentItems.filter(i => i.optionsKey !== optionsKey))
  }, [])

  const updateQuantity = useCallback((optionsKey: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(optionsKey)
      return
    }
    
    setItems(currentItems =>
      currentItems.map(i =>
        i.optionsKey === optionsKey ? { ...i, quantity } : i
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
