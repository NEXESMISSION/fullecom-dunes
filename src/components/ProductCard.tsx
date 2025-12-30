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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              نفذ من المخزون
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-primary-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="أضف إلى السلة"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{productType}</p>
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-primary-600 mt-2">{product.price.toFixed(2)} د.ت</p>
      </div>
    </Link>
  )
}
