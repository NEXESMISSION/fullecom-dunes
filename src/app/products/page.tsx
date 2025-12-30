'use client'

import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ProductSkeleton'
import Footer from '@/components/Footer'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'

interface ProductType {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('الكل')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, typesRes] = await Promise.all([
          supabase
            .from('products')
            .select('*, product_type:product_types(id, name)')
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('product_types')
            .select('id, name')
            .order('name')
        ])

        if (productsRes.error) throw productsRes.error
        setProducts(productsRes.data || [])
        setProductTypes(typesRes.data || [])
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'الكل' || product.product_type?.name === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">جميع المنتجات</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">تصفح مجموعتنا من المنتجات</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-8 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن منتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-10"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden btn-secondary flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              فلترة
            </button>
          </div>

          {/* Type Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedType('الكل')}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  selectedType === 'الكل'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل
              </button>
              {productTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.name)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    selectedType === type.name
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedType !== 'الكل') && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>الفلاتر النشطة:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                  بحث: {searchQuery}
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedType !== 'الكل' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                  {selectedType}
                  <button onClick={() => setSelectedType('الكل')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          {loading ? 'جاري التحميل...' : `${filteredProducts.length} منتج`}
        </p>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">لم يتم العثور على منتجات تطابق معاييرك.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedType('الكل')
              }}
              className="mt-4 text-primary-600 hover:underline"
            >
              مسح جميع الفلاتر
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
