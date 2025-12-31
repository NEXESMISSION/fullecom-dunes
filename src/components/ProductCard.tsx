'use client'

import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      options: {},
    })
  }

  const productType = product.product_type?.name || product.category || 'Général'

  return (
    <Link href={`/products/${product.id}`} className="card group overflow-hidden block border border-gray-100">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <Image
          src={product.image || '/placeholder.png'}
          alt={product.name}
          fill
          className={`object-cover group-hover:scale-105 transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              Épuisé
            </span>
          </div>
        )}
        {/* Add to cart button - visible on mobile, hover on desktop */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 left-2 p-2 bg-primary-600 text-white rounded-full shadow-lg active:scale-95 transition-transform sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Ajouter au panier"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-0.5">{productType}</p>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm sm:text-lg font-bold text-primary-600">{product.price.toFixed(2)} DT</p>
          {product.original_price && product.original_price > product.price && (
            <p className="text-xs sm:text-sm text-gray-400 line-through">{product.original_price.toFixed(2)} DT</p>
          )}
        </div>
      </div>
    </Link>
  )
}
