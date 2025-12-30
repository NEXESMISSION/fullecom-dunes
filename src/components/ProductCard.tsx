'use client'

import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

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

  const productType = product.product_type?.name || product.category || 'عام'

  return (
    <Link href={`/products/${product.id}`} className="card group overflow-hidden block">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image || '/placeholder.png'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              نفذ
            </span>
          </div>
        )}
        {/* Add to cart button - visible on mobile, hover on desktop */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 p-2 bg-primary-600 text-white rounded-full shadow-lg active:scale-95 transition-transform sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="أضف إلى السلة"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="p-2 sm:p-4">
        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-0.5">{productType}</p>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-sm sm:text-lg font-bold text-primary-600 mt-1">{product.price.toFixed(2)} د.ت</p>
      </div>
    </Link>
  )
}
