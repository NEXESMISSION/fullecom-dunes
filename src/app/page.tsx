import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Footer from '@/components/Footer'
import ImageCarousel from '@/components/ImageCarousel'
import ProductSlider from '@/components/ProductSlider'
import TrustBadges from '@/components/TrustBadges'
import CategoryCarousel from '@/components/CategoryCarousel'
import { getHomePageData } from '@/lib/data-fetchers'

function ShopAllProductsButton({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/products"
      className={`btn-primary inline-flex items-center justify-center gap-2 ${className}`}
    >
      Voir Tous les Produits
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

// Server Component with ISR - pre-renders at build time and revalidates every 60s
// This makes the page load instantly with cached data
export const revalidate = 60

export default async function HomePage() {
  // Fetch all data server-side - this happens at build time with ISR
  const data = await getHomePageData()
  
  const { 
    categories, 
    banners, 
    sections: landingSections
  } = data

  // Prepare carousel images
  const carouselImages = banners
    .filter(b => b.image)
    .map(b => ({
      id: b.id,
      image: b.image,
      title: b.title || '',
      link: b.link
    }))

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Carousel - Images load instantly as they're pre-rendered */}
      <section className="w-full relative">
        <ImageCarousel images={carouselImages} autoPlayInterval={5000} />

        <div className="absolute inset-x-0 bottom-10 sm:bottom-12 flex justify-center px-4">
          <ShopAllProductsButton className="rounded-full px-7 py-2.5 shadow-lg" />
        </div>
      </section>

      {/* Categories Carousel - Better UX with manual controls */}
      {categories.length > 0 && (
        <>
          <CategoryCarousel categories={categories} />
          <div className="py-6 text-center bg-gray-50">
            <ShopAllProductsButton className="rounded-full px-7 py-2.5" />
          </div>
        </>
      )}

      {/* Product Sections - Only render sections with products */}
      {landingSections.length > 0 && (
        <>
          {landingSections.map((section) => (
            <div key={section.id}>
              {section.products && section.products.length > 0 && (
                <ProductSlider
                  title={section.title}
                  subtitle={section.subtitle || undefined}
                  products={section.products}
                  sideImage={section.side_image || undefined}
                  topImage={section.top_image || undefined}
                  backgroundColor={section.background_color || 'bg-white'}
                />
              )}
            </div>
          ))}

          <div className="py-10 text-center">
            <ShopAllProductsButton className="rounded-full px-8 py-3" />
          </div>
        </>
      )}

      {/* Trust Badges */}
      <TrustBadges />

      {/* Footer */}
      <Footer />
    </div>
  )
}
