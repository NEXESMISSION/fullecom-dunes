'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ProductSkeleton'
import Footer from '@/components/Footer'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'

interface ProductType {
  id: string
  name: string
}

interface SiteSettings {
  hero_bg_type: 'gradient' | 'color' | 'image'
  hero_bg_value: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [heroSettings, setHeroSettings] = useState<SiteSettings>({
    hero_bg_type: 'gradient',
    hero_bg_value: 'from-primary-600 to-primary-800'
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products, categories, and settings in parallel
        const [productsRes, categoriesRes, settingsRes] = await Promise.all([
          supabase
            .from('products')
            .select('*, product_type:product_types(id, name)')
            .eq('is_active', true)
            .limit(8)
            .order('created_at', { ascending: false }),
          supabase
            .from('product_types')
            .select('id, name')
            .order('name'),
          supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'hero_background')
            .maybeSingle()
        ])

        if (productsRes.error) throw productsRes.error
        setProducts(productsRes.data || [])
        setCategories(categoriesRes.data || [])
        
        // Set hero settings if found
        if (settingsRes.data?.value) {
          try {
            const parsed = JSON.parse(settingsRes.data.value)
            setHeroSettings(parsed)
          } catch (e) {
            // Keep default
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate hero background style
  const getHeroStyle = () => {
    if (heroSettings.hero_bg_type === 'image') {
      return {
        backgroundImage: `url(${heroSettings.hero_bg_value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    } else if (heroSettings.hero_bg_type === 'color') {
      return { backgroundColor: heroSettings.hero_bg_value }
    }
    return {} // gradient uses className
  }

  const heroClassName = heroSettings.hero_bg_type === 'gradient' 
    ? `bg-gradient-to-br ${heroSettings.hero_bg_value}` 
    : ''

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className={`relative text-white ${heroClassName}`}
        style={getHeroStyle()}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
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

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-6 sm:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">التصنيفات</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-full text-sm font-medium transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
              عرض الكل
              <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
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
              عرض كل المنتجات
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
            تصفح المنتجات
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
