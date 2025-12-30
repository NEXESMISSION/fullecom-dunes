'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Truck, Shield, Clock, CreditCard } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ProductSkeleton'
import Footer from '@/components/Footer'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'

const features = [
  {
    icon: Truck,
    title: 'توصيل مجاني',
    description: 'للطلبات فوق 50 دينار',
  },
  {
    icon: CreditCard,
    title: 'الدفع عند الاستلام',
    description: 'لا يتطلب دفع مسبق',
  },
  {
    icon: Shield,
    title: 'تسوق آمن',
    description: 'بياناتك محمية',
  },
  {
    icon: Clock,
    title: 'شحن سريع',
    description: '2-5 أيام عمل',
  },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_type:product_types(id, name)')
          .eq('is_active', true)
          .limit(8)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
              تسوق منتجات عالية الجودة
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-primary-100 mb-6">
              اكتشف منتجات مميزة مع توصيل مجاني. ادفع فقط عند استلام طلبك - لا يتطلب دفع مسبق.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-center">
                تسوق الآن
                <ArrowRight className="inline-block mr-2 h-5 w-5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-2 sm:p-4">
                <feature.icon className="h-6 w-6 sm:h-10 sm:w-10 mx-auto text-primary-600 mb-2" />
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-xs text-gray-500 hidden sm:block">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 sm:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">منتجات مميزة</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">اكتشف أحدث المنتجات</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-outline inline-block">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3">هل أنت مستعد للتسوق؟</h2>
          <p className="text-gray-400 mb-6 text-sm sm:text-base max-w-2xl mx-auto">
            لا تحتاج حساب. أضف المنتجات وادفع عند الاستلام.
          </p>
          <Link href="/products" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
