import { supabase } from './supabase'
import { cache } from './cache'
import { Product } from '@/types'

interface HomePageData {
  products: Product[]
  categories: Array<{ id: string; name: string; image?: string }>
  banners: Array<{ id: string; title: string; image: string; link?: string }>
  sections: Array<{
    id: string
    title: string
    subtitle: string | null
    side_image: string | null
    top_image: string | null
    background_color: string
    max_products: number
    products?: Product[]
  }>
  settings: {
    heroBackground: any
    landingConfig: any
    siteContent: any
  }
}

// Optimized data fetching with caching and selective fields
export async function getHomePageData(): Promise<HomePageData> {
  const cacheKey = 'homepage-data'
  const cached = await cache.get<HomePageData>(cacheKey)
  
  if (cached) return cached

  try {
    // Parallel fetching with optimized queries
    const [
      productsRes,
      categoriesRes, 
      bannersRes,
      sectionsRes,
      settingsRes
    ] = await Promise.all([
      // Only fetch needed fields and limit results
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(8)
        .order('created_at', { ascending: false }),
      
      // Categories with minimal fields
      supabase
        .from('product_types')
        .select('id, name, image')
        .order('name')
        .limit(20),
      
      // Active banners only
      supabase
        .from('banners')
        .select('id, title, image, link')
        .eq('is_active', true)
        .order('order')
        .limit(5),
      
      // Landing sections with products
      supabase
        .from('landing_sections')
        .select('id, title, subtitle, side_image, top_image, background_color, max_products, product_source, category_id')
        .eq('is_active', true)
        .order('display_order')
        .limit(10),
      
      // Site settings - combined query
      supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['hero_background', 'landing_config', 'site_content'])
    ])

    // Process sections and fetch their products
    let sections = sectionsRes.data || []
    if (sections.length > 0) {
      sections = await Promise.all(
        sections.map(async (section) => {
          let products = []
          
          const query = supabase
            .from('products')
            .select('id, name, price, image, product_type_id')
            .eq('is_active', true)
            .limit(section.max_products || 8)
            .order('created_at', { ascending: false })
          
          if (section.product_source === 'category' && section.category_id) {
            query.eq('product_type_id', section.category_id)
          }
          
          const { data } = await query
          products = data || []
          
          return { ...section, products }
        })
      )
    }

    // Process settings
    const settings = {
      heroBackground: {},
      landingConfig: {},
      siteContent: {}
    }
    
    settingsRes.data?.forEach(item => {
      if (item.key === 'hero_background' && item.value) {
        settings.heroBackground = JSON.parse(item.value)
      } else if (item.key === 'landing_config' && item.value) {
        settings.landingConfig = JSON.parse(item.value)
      } else if (item.key === 'site_content' && item.value) {
        settings.siteContent = JSON.parse(item.value)
      }
    })

    const data = {
      products: productsRes.data || [],
      categories: categoriesRes.data || [],
      banners: bannersRes.data || [],
      sections,
      settings
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, data, 300)
    
    return data
  } catch (error) {
    console.error('Failed to fetch homepage data:', error)
    return {
      products: [],
      categories: [],
      banners: [],
      sections: [],
      settings: {
        heroBackground: {},
        landingConfig: {},
        siteContent: {}
      }
    }
  }
}

export async function getProductById(id: string) {
  const cacheKey = `product-${id}`
  const cached = await cache.get(cacheKey)
  
  if (cached) return cached

  const { data } = await supabase
    .from('products')
    .select(`
      *,
      product_type:product_types(*)
    `)
    .eq('id', id)
    .single()
  
  if (data) {
    await cache.set(cacheKey, data, 600) // Cache for 10 minutes
  }
  
  return data
}

export async function getProductsPage(category?: string, search?: string) {
  const query = supabase
    .from('products')
    .select('id, name, description, price, image, product_type_id, stock, created_at')
    .eq('is_active', true)
  
  if (category) {
    // Get category IDs including children
    const { data: categoryData } = await supabase
      .from('product_types')
      .select('id')
      .eq('name', category)
    
    if (categoryData?.length) {
      query.eq('product_type_id', categoryData[0].id)
    }
  }
  
  if (search) {
    query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }
  
  const { data: products } = await query.order('created_at', { ascending: false })
  
  // Get categories separately
  const { data: categories } = await supabase
    .from('product_types')
    .select('id, name, parent_id')
    .order('name')
  
  return { products: products || [], categories: categories || [] }
}
