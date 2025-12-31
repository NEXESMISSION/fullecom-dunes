'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ProductSkeleton'
import Footer from '@/components/Footer'
import ImageCarousel from '@/components/ImageCarousel'
import ProductSlider from '@/components/ProductSlider'
import CategoriesPopup from '@/components/CategoriesPopup'
import TrustBadges from '@/components/TrustBadges'
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
  hero_bg_type: 'gradient' | 'color' | 'image' | 'custom-gradient'
  hero_bg_value: string
  customGradientFrom?: string
  customGradientTo?: string
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

interface LandingSection {
  id: string
  title: string
  subtitle: string | null
  side_image: string | null
  top_image: string | null
  background_color: string
  display_order: number
  max_products: number
  is_active: boolean
  product_source: 'latest' | 'category' | 'manual'
  category_id: string | null
  products?: Product[]
}

interface SiteContent {
  logoUrl: string
  logoSize: 'small' | 'medium' | 'large'
  storeName: string
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  ctaTitle: string
  ctaSubtitle: string
  ctaButtonText: string
  footerDescription: string
  footerPhone: string
  footerEmail: string
  footerAddress: string
  footerSupportText: string
  promoBannerImage?: string
  promoBannerTitle?: string
  promoBannerSubtitle?: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductType[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [promoImages, setPromoImages] = useState<PromoImage[]>([])
  const [landingSections, setLandingSections] = useState<LandingSection[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showCategoriesPopup, setShowCategoriesPopup] = useState(false)
  const [heroSettings, setHeroSettings] = useState<SiteSettings>({
    hero_bg_type: 'gradient',
    hero_bg_value: 'from-primary-600 to-primary-800'
  })
  const [landingConfig, setLandingConfig] = useState<LandingConfig>({
    showCategories: true,
    showBanners: true,
    showPromoImages: true,
    showProducts: true,
    categoriesTitle: 'Parcourir par Catégorie',
    bannersTitle: 'Offres Spéciales',
    promoTitle: 'À Découvrir',
    productsTitle: 'Produits Vedettes'
  })
  const [siteContent, setSiteContent] = useState<SiteContent>({
    logoUrl: '',
    logoSize: 'medium',
    storeName: 'Notre Boutique',
    heroTitle: 'Produits de Qualité Premium',
    heroSubtitle: 'Découvrez des produits exceptionnels avec livraison gratuite. Paiement à la livraison.',
    heroButtonText: 'Acheter Maintenant',
    ctaTitle: 'Prêt à Commander?',
    ctaSubtitle: 'Pas besoin de compte. Ajoutez vos produits et payez à la livraison.',
    ctaButtonText: 'Voir les Produits',
    footerDescription: 'Produits de qualité livrés à votre porte. Paiement à la livraison.',
    footerPhone: '+216 12 345 678',
    footerEmail: 'support@store.com',
    footerAddress: 'Rue du Commerce, Ville',
    footerSupportText: 'Nous sommes là pour vous aider. Contactez-nous pour toute question.'
  })

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

        // Fetch site content
        try {
          const contentRes = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'site_content')
            .maybeSingle()
          
          if (contentRes.data?.value) {
            const parsed = JSON.parse(contentRes.data.value)
            setSiteContent(prev => ({ ...prev, ...parsed }))
          }
        } catch (e) {
          console.log('Site content not found')
        }

        // Fetch landing sections with their products
        try {
          const sectionsRes = await supabase
            .from('landing_sections')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
          
          console.log('Sections response:', sectionsRes)
          
          if (!sectionsRes.error && sectionsRes.data && sectionsRes.data.length > 0) {
            // Fetch products for each section based on product_source
            const sectionsWithProducts = await Promise.all(
              sectionsRes.data.map(async (section) => {
                let sectionProducts: Product[] = []
                
                try {
                  if (section.product_source === 'category' && section.category_id) {
                    // Fetch products from specific category
                    const { data, error } = await supabase
                      .from('products')
                      .select('*, product_type:product_types(id, name)')
                      .eq('is_active', true)
                      .eq('product_type_id', section.category_id)
                      .limit(section.max_products || 8)
                      .order('created_at', { ascending: false })
                    
                    if (error) console.error('Section products error:', error)
                    sectionProducts = (data as Product[]) || []
                  } else {
                    // Fetch latest products
                    const { data, error } = await supabase
                      .from('products')
                      .select('*, product_type:product_types(id, name)')
                      .eq('is_active', true)
                      .limit(section.max_products || 8)
                      .order('created_at', { ascending: false })
                    
                    if (error) console.error('Section products error:', error)
                    sectionProducts = (data as Product[]) || []
                  }
                } catch (productError) {
                  console.error('Error fetching products for section:', productError)
                }
                
                console.log(`Section "${section.title}" has ${sectionProducts.length} products`)
                return { ...section, products: sectionProducts }
              })
            )
            console.log('Final sections with products:', sectionsWithProducts)
            setLandingSections(sectionsWithProducts)
          } else if (sectionsRes.error) {
            console.error('Error fetching sections:', sectionsRes.error)
          }
        } catch (e) {
          console.error('Landing sections error:', e)
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
  const getHeroStyle = (): React.CSSProperties => {
    if (heroSettings.hero_bg_type === 'image') {
      return {
        backgroundImage: `url(${heroSettings.hero_bg_value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    } else if (heroSettings.hero_bg_type === 'color') {
      return { backgroundColor: heroSettings.hero_bg_value }
    } else if (heroSettings.hero_bg_type === 'custom-gradient') {
      const from = heroSettings.customGradientFrom || '#7c3aed'
      const to = heroSettings.customGradientTo || '#5b21b6'
      return { background: `linear-gradient(to bottom right, ${from}, ${to})` }
    }
    return {} // gradient uses className
  }

  const heroClassName = heroSettings.hero_bg_type === 'gradient' 
    ? `bg-gradient-to-br ${heroSettings.hero_bg_value}` 
    : ''

  // Prepare carousel images from banners
  const carouselImages = banners.filter(b => b.image).map(b => ({
    id: b.id,
    image: b.image,
    title: b.title,
    link: b.link
  }))

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Image Carousel - replaces hero */}
      <section className="w-full">
        <ImageCarousel images={carouselImages} autoPlayInterval={5000} />
      </section>

      {/* Categories Grid with Images - Horizontal scroll on mobile */}
      {landingConfig.showCategories && (
        <section className="py-6 sm:py-8 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4">{landingConfig.categoriesTitle}</h2>
            {!dataLoaded ? (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-shrink-0 w-36 sm:w-auto aspect-square bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="group relative flex-shrink-0 w-36 sm:w-auto aspect-square overflow-hidden bg-gray-100"
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
              <p className="text-gray-500 text-center py-8">Aucune catégorie - Ajoutez-les depuis le panneau d'administration</p>
            )}
          </div>
        </section>
      )}

      {/* Promo Images Slider - Single row horizontal scroll */}
      {landingConfig.showPromoImages && (
        <section className="py-6 sm:py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4">{landingConfig.promoTitle}</h2>
            {!dataLoaded ? (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-shrink-0 w-28 sm:w-32 aspect-square bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : promoImages.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {promoImages.map((img) => (
                  <Link
                    key={img.id}
                    href={img.link || '#'}
                    className="group relative flex-shrink-0 w-28 sm:w-36 lg:w-40 aspect-square overflow-hidden bg-gray-100"
                  >
                    <img
                      src={img.image}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                      <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-2">{img.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune image promotionnelle - Ajoutez-les depuis le panneau d'administration</p>
            )}
          </div>
        </section>
      )}

      {/* Full Width Banner - Desktop Only - Admin Controlled */}
      {siteContent.promoBannerImage && (
        <section className="hidden md:block py-4">
          <div className="max-w-7xl mx-auto px-8">
            <div className="relative h-32 lg:h-40 overflow-hidden rounded-xl">
              <img 
                src={siteContent.promoBannerImage || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=300&fit=crop'}
                alt={siteContent.promoBannerTitle || 'Offres spéciales'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-transparent flex items-center">
                <div className="px-8">
                  <h3 className="text-white text-2xl font-bold">{siteContent.promoBannerTitle || 'Offres Spéciales'}</h3>
                  <p className="text-white/80 text-sm mt-1">{siteContent.promoBannerSubtitle || 'Découvrez nos meilleures offres du moment'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Product Sections from Admin */}
      {landingSections.length > 0 ? (
        <>
          {landingSections.map((section) => (
            section.products && section.products.length > 0 && (
              <ProductSlider
                key={section.id}
                title={section.title}
                subtitle={section.subtitle || undefined}
                products={section.products}
                sideImage={section.side_image || undefined}
                topImage={section.top_image || undefined}
                backgroundColor={section.background_color || 'bg-white'}
              />
            )
          ))}

          {/* See All Button */}
          <div className="py-6 text-center">
            <Link href="/products" className="btn-primary inline-block">
              Voir Tous les Produits
              <ArrowRight className="inline-block mr-2 h-4 w-4 rotate-180" />
            </Link>
          </div>
        </>
      ) : landingConfig.showProducts && products.length > 0 && (
        <>
          {/* Fallback: Show latest products if no sections configured */}
          <ProductSlider
            title={landingConfig.productsTitle || 'Produits Vedettes'}
            subtitle="Découvrez nos produits"
            products={products}
            backgroundColor="bg-white"
          />

          {/* See All Button */}
          <div className="py-6 text-center">
            <Link href="/products" className="btn-primary inline-block">
              Voir Tous les Produits
              <ArrowRight className="inline-block mr-2 h-4 w-4 rotate-180" />
            </Link>
          </div>
        </>
      )}

      {/* Trust Badges */}
      <TrustBadges />

      <Footer />
      
      {/* Categories Popup */}
      <CategoriesPopup 
        isOpen={showCategoriesPopup} 
        onClose={() => setShowCategoriesPopup(false)} 
      />
    </div>
  )
}
