'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, LayoutGrid, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ProductSkeleton'
import Footer from '@/components/Footer'
import CategoriesPopup from '@/components/CategoriesPopup'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'

interface SiteContent {
  storeName?: string
  footerDescription?: string
  footerPhone?: string
  footerEmail?: string
  footerAddress?: string
  footerSupportText?: string
}

interface Category {
  id: string
  name: string
  parent_id: string | null
  children?: Category[]
}

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || '')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const [showCategoriesPopup, setShowCategoriesPopup] = useState(false)
  const [siteContent, setSiteContent] = useState<SiteContent>({})

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0)
    
    async function fetchData() {
      try {
        const [productsRes, categoriesRes, contentRes] = await Promise.all([
          supabase
            .from('products')
            .select('*, product_type:product_types(id, name)')
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase.from('product_types').select('id, name, parent_id').order('name'),
          supabase.from('site_settings').select('value').eq('key', 'site_content').maybeSingle()
        ])

        if (productsRes.error) throw productsRes.error
        setProducts(productsRes.data || [])
        
        // Build hierarchical categories
        const allCats = categoriesRes.data || []
        const buildTree = (parentId: string | null): Category[] => {
          return allCats
            .filter((c: Category) => c.parent_id === parentId)
            .map((c: Category) => ({
              ...c,
              children: buildTree(c.id)
            }))
        }
        setCategories(buildTree(null))
        
        if (contentRes.data?.value) {
          setSiteContent(JSON.parse(contentRes.data.value))
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

  // Update category from URL when it changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  // Get all category names including children for filtering
  const getAllCategoryNames = (cats: Category[], targetName: string): string[] => {
    const names: string[] = []
    const findAndCollect = (catList: Category[], found: boolean): boolean => {
      for (const cat of catList) {
        if (cat.name === targetName || found) {
          names.push(cat.name)
          if (cat.children) {
            cat.children.forEach(child => {
              names.push(child.name)
              if (child.children) findAndCollect(child.children, true)
            })
          }
          if (cat.name === targetName) return true
        } else if (cat.children) {
          if (findAndCollect(cat.children, false)) return true
        }
      }
      return false
    }
    findAndCollect(cats, false)
    return names
  }

  // Filter and sort products
  const categoryNamesToMatch = selectedCategory ? getAllCategoryNames(categories, selectedCategory) : []
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || 
        categoryNamesToMatch.includes(product.product_type?.name || '')
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price
        case 'price-high': return b.price - a.price
        case 'name': return a.name.localeCompare(b.name, 'fr')
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('newest')
  }

  const hasActiveFilters = searchQuery || selectedCategory || sortBy !== 'newest'

  // Toggle category expansion
  const toggleCat = (id: string) => {
    setExpandedCats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  // Render category with children
  const renderCategory = (cat: Category, level: number = 0) => {
    const hasChildren = cat.children && cat.children.length > 0
    const isExpanded = expandedCats.has(cat.id)
    const isSelected = selectedCategory === cat.name
    
    return (
      <div key={cat.id}>
        <div className="flex items-center">
          {hasChildren && (
            <button
              onClick={() => toggleCat(cat.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
          {!hasChildren && level > 0 && <span className="w-5" />}
          <button
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex-1 text-left py-1 text-sm ${isSelected ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
            style={{ paddingLeft: level > 0 && !hasChildren ? 0 : undefined }}
          >
            {cat.name}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-3 border-l pl-2">
            {cat.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Render mobile category with unlimited depth
  const renderMobileCategory = (cat: Category, level: number): React.ReactNode => {
    const hasChildren = cat.children && cat.children.length > 0
    const isExpanded = expandedCats.has(cat.id)
    const isSelected = selectedCategory === cat.name
    const bgColor = level === 0 ? '' : level === 1 ? 'bg-gray-50' : 'bg-gray-100'
    const paddingLeft = 16 + level * 16
    
    return (
      <div key={cat.id} className={bgColor}>
        <div className={`flex items-center border-b ${isSelected ? 'bg-primary-50' : ''}`}>
          <button
            onClick={() => { setSelectedCategory(cat.name); setShowFilters(false); }}
            className={`flex-1 text-left py-2.5 ${level === 0 ? 'text-base' : 'text-sm'} ${isSelected ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
            style={{ paddingLeft }}
          >
            {cat.name}
          </button>
          {hasChildren && (
            <button
              onClick={() => toggleCat(cat.id)}
              className="px-4 py-2.5 text-gray-400"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {cat.children!.map(child => renderMobileCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 pt-[60px] sm:pt-[72px] pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-[92px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">Catégories</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs border-0 bg-transparent text-gray-500 py-0 pr-6 focus:ring-0"
                  >
                    <option value="newest">Récent</option>
                    <option value="price-low">Prix ↑</option>
                    <option value="price-high">Prix ↓</option>
                    <option value="name">A-Z</option>
                  </select>
                </div>

                {/* All Products */}
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block w-full text-left py-1.5 text-sm border-b mb-2 ${!selectedCategory ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                >
                  Tous les produits
                </button>

                {/* Categories with expandable subcategories */}
                <div className="space-y-0.5">
                  {categories.map(cat => renderCategory(cat))}
                </div>

                {/* Clear filter */}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="mt-4 text-xs text-red-500 hover:text-red-600"
                  >
                    ✕ Effacer
                  </button>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {selectedCategory || 'Tous les produits'}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    {loading ? 'Chargement...' : `${filteredProducts.length} produit(s)`}
                  </p>
                </div>
                
                {/* Mobile Filters - Button to open popup */}
                <div className="lg:hidden flex gap-2">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="flex items-center gap-1 px-3 py-1.5 border bg-white text-xs"
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    Filtres
                    {selectedCategory && <span className="bg-primary-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">1</span>}
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <ProductGridSkeleton count={12} />
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500">Aucun produit trouvé.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Popup - Full screen category browser */}
      {showFilters && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Catégories</h3>
            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Chercher une catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto">
            {/* All products */}
            <button
              onClick={() => { setSelectedCategory(''); setShowFilters(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 border-b ${!selectedCategory ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
            >
              <span className="font-medium">Tous les produits</span>
            </button>
            
            {/* Categories with unlimited subcategories - recursive */}
            {categories.map((cat: Category) => renderMobileCategory(cat, 0))}
          </div>

          {/* Sort options at bottom */}
          <div className="border-t p-3 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Trier par</p>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { value: 'newest', label: 'Récent' },
                { value: 'price-low', label: 'Prix ↑' },
                { value: 'price-high', label: 'Prix ↓' },
                { value: 'name', label: 'A-Z' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as SortOption)}
                  className={`px-3 py-1.5 text-xs whitespace-nowrap border rounded ${sortBy === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
