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

      {/* Auto-sliding Categories Section - Infinite Loop */}
      {categories.length > 0 && (
        <section className="py-3 sm:py-4 bg-gray-50 overflow-hidden animate-fade-in-up">
          <div className="relative">
            {/* Gradient fades on sides */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            
            {/* Sliding container */}
            <div className="flex animate-scroll-infinite">
              {[...categories, ...categories, ...categories].map((cat, index) => (
                <Link
                  key={`${cat.id}-${index}`}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="flex-shrink-0 mx-1.5 sm:mx-2 group"
                >
                  <div className="w-20 sm:w-28 bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
                    <div className="aspect-square relative overflow-hidden">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-1.5 sm:p-2 text-center">
                      <h3 className="text-[10px] sm:text-sm font-medium text-gray-800 truncate">{cat.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Product Sections from Admin Only */}
      {landingSections.length > 0 && (
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
