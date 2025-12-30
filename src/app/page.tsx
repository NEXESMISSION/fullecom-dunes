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
  image?: string
}

interface Banner {
  id: string
  title: string
  image: string
  link?: string
  size?: 'full' | 'half' | 'third'
  height?: 'tall' | 'medium' | 'short' | 'thin'
}

interface PromoImage {
  id: string
  title: string
  image: string
  link?: string
  size?: 'full' | 'half' | 'third'
}

interface SiteSettings {
  hero_bg_type: 'gradient' | 'color' | 'image'
  hero_bg_value: string
}

interface LandingConfig {
  showCategories: boolean
  showBanners: boolean
  showPromoImages: boolean
  showProducts: boolean
  categoriesTitle: string
  bannersTitle: string
  promoTitle: string
  productsTitle: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductType[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [promoImages, setPromoImages] = useState<PromoImage[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [heroSettings, setHeroSettings] = useState<SiteSettings>({
    hero_bg_type: 'gradient',
    hero_bg_value: 'from-primary-600 to-primary-800'
  })
  const [landingConfig, setLandingConfig] = useState<LandingConfig>({
    showCategories: true,
    showBanners: true,
    showPromoImages: true,
    showProducts: true,
    categoriesTitle: 'تسوق حسب الفئة',
    bannersTitle: 'عروض مميزة',
    promoTitle: 'اكتشف المزيد',
    productsTitle: 'منتجات مميزة'
  })
  const [initialHeroSettings] = useState<SiteSettings>({
    hero_bg_type: 'gradient',
    hero_bg_value: 'from-primary-600 to-primary-800'
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products (required)
        const productsRes = await supabase
          .from('products')
          .select('*, product_type:product_types(id, name)')
          .eq('is_active', true)
          .limit(8)
          .order('created_at', { ascending: false })

        if (!productsRes.error) {
          setProducts(productsRes.data || [])
        }

        // Fetch categories (may have image column or not)
        const categoriesRes = await supabase
          .from('product_types')
          .select('id, name, image')
          .order('name')
        
        if (!categoriesRes.error) {
          setCategories(categoriesRes.data || [])
        }

        // Fetch banners (table may not exist)
        try {
          const bannersRes = await supabase
            .from('banners')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true })
          
          if (!bannersRes.error) {
            setBanners(bannersRes.data || [])
          }
        } catch (e) {
          console.log('Banners table not found')
        }

        // Fetch promo images (table may not exist)
        try {
          const promoRes = await supabase
            .from('promo_images')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true })
          
          if (!promoRes.error) {
            setPromoImages(promoRes.data || [])
          }
        } catch (e) {
          console.log('Promo images table not found')
        }

        // Fetch hero settings (table may not exist)
        try {
          const settingsRes = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'hero_background')
            .maybeSingle()
          
          if (settingsRes.data?.value) {
            const parsed = JSON.parse(settingsRes.data.value)
            setHeroSettings(parsed)
          }
        } catch (e) {
          console.log('Site settings table not found')
        }

        // Fetch landing page config
        try {
          const configRes = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'landing_config')
            .maybeSingle()
          
          if (configRes.data?.value) {
            const parsed = JSON.parse(configRes.data.value)
            setLandingConfig(prev => ({ ...prev, ...parsed }))
          }
        } catch (e) {
          console.log('Landing config not found')
        }

        setDataLoaded(true)
      } catch (error) {
        console.error('Failed to fetch data:', error)
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

  // Full page loading screen
  if (!dataLoaded) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 text-sm animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    )
  }

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

      {/* Categories Grid with Images - Horizontal scroll on mobile */}
      {landingConfig.showCategories && (
        <section className="py-8 sm:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-6">{landingConfig.categoriesTitle}</h2>
            {!dataLoaded ? (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-shrink-0 w-36 sm:w-auto aspect-square rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="group relative flex-shrink-0 w-36 sm:w-auto aspect-square rounded-xl overflow-hidden bg-gray-100"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-white font-bold text-sm sm:text-lg">{cat.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد فئات - أضفها من لوحة التحكم</p>
            )}
          </div>
        </section>
      )}

      {/* Promotional Banners - Horizontal scroll on mobile with size control */}
      {landingConfig.showBanners && (
        <section className="py-8 sm:py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-6">{landingConfig.bannersTitle}</h2>
            {!dataLoaded ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[85vw] sm:w-auto aspect-video rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : banners.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
                {banners.map((banner) => {
                  const sizeClass = banner.size === 'full' ? 'w-[85vw] sm:w-full' 
                    : banner.size === 'half' ? 'w-[85vw] sm:w-[calc(50%-8px)]' 
                    : 'w-[85vw] sm:w-[calc(33.333%-11px)]'
                  const heightClass = banner.height === 'tall' ? 'aspect-video' 
                    : banner.height === 'short' ? 'aspect-[3/1]' 
                    : banner.height === 'thin' ? 'aspect-[4/1]' 
                    : 'aspect-[2/1]'
                  return (
                    <Link
                      key={banner.id}
                      href={banner.link || '#'}
                      className={`group relative flex-shrink-0 ${sizeClass} ${heightClass} rounded-xl overflow-hidden bg-gray-200`}
                    >
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد بانرات - أضفها من لوحة التحكم</p>
            )}
          </div>
        </section>
      )}

      {/* Promo Images Grid - Horizontal scroll on mobile with size control */}
      {landingConfig.showPromoImages && (
        <section className="py-8 sm:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-6">{landingConfig.promoTitle}</h2>
            {!dataLoaded ? (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-shrink-0 w-36 sm:w-auto aspect-square rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : promoImages.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
                {promoImages.map((img) => {
                  const sizeClass = img.size === 'full' ? 'w-[85vw] sm:w-full' 
                    : img.size === 'half' ? 'w-44 sm:w-[calc(50%-6px)]' 
                    : 'w-36 sm:w-[calc(25%-9px)]'
                  return (
                    <Link
                      key={img.id}
                      href={img.link || '#'}
                      className={`group relative flex-shrink-0 ${sizeClass} aspect-square rounded-xl overflow-hidden bg-gray-100`}
                    >
                      <img
                        src={img.image}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h3 className="text-white font-bold text-sm sm:text-lg">{img.title}</h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد صور ترويجية - أضفها من لوحة التحكم</p>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {landingConfig.showProducts && (
        <section className="py-8 sm:py-16 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{landingConfig.productsTitle}</h2>
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
      )}

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
