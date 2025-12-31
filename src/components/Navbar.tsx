'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Menu, X, ChevronDown, ChevronRight, LayoutGrid, Search, AlertCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import CategoriesPopup from './CategoriesPopup'

interface Category {
  id: string
  name: string
  parent_id?: string | null
  children?: Category[]
}

interface SiteContent {
  logoUrl?: string
  logoSize?: 'small' | 'medium' | 'large'
  storeName?: string
  announcementText?: string
}

// Recursive component for rendering category items with unlimited depth
function CategoryMenuItem({ 
  category, 
  level = 0,
  onNavigate 
}: { 
  category: Category
  level?: number
  onNavigate?: () => void
}) {
  const hasChildren = category.children && category.children.length > 0
  
  return (
    <div className="relative group/item">
      <Link
        href={`/products?category=${encodeURIComponent(category.name)}`}
        onClick={onNavigate}
        className={`flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors rounded ${
          level === 0 
            ? 'font-semibold text-gray-900 hover:text-primary-600 hover:bg-gray-50' 
            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
        }`}
      >
        <span className="truncate">{category.name}</span>
        {hasChildren && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
      </Link>
      
      {hasChildren && (
        <div className="absolute left-full top-0 ml-0 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-150" style={{ zIndex: 9999 }}>
          <div className="bg-white shadow-2xl border rounded-lg py-2 min-w-52 max-h-[400px] overflow-y-auto">
            {category.children!.map((child) => (
              <CategoryMenuItem 
                key={child.id} 
                category={child} 
                level={level + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Recursive mobile category component with tap-to-expand
function MobileCategoryItem({ 
  category, 
  level = 0,
  expandedIds,
  onToggleExpand,
  onNavigate 
}: { 
  category: Category
  level?: number
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onNavigate: () => void
}) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedIds.has(category.id)
  const paddingLeft = 16 + level * 16
  
  return (
    <div>
      <div 
        className="flex items-center border-b border-gray-100"
        style={{ paddingLeft }}
      >
        <Link
          href={`/products?category=${encodeURIComponent(category.name)}`}
          onClick={onNavigate}
          className={`flex-1 py-3 transition-colors ${
            level === 0 
              ? 'font-medium text-gray-800 hover:text-primary-600' 
              : 'text-sm text-gray-600 hover:text-primary-600'
          }`}
        >
          {category.name}
        </Link>
        {hasChildren && (
          <button
            onClick={() => onToggleExpand(category.id)}
            className="p-3 text-gray-400 hover:text-primary-600 transition-colors"
            aria-label={isExpanded ? 'Réduire' : 'Développer'}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="bg-gray-50/50">
          {category.children!.map((child) => (
            <MobileCategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [badgeAnimate, setBadgeAnimate] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(false)
  const [expandedMobileIds, setExpandedMobileIds] = useState<Set<string>>(new Set())
  const [showCategoriesPopup, setShowCategoriesPopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [siteContent, setSiteContent] = useState<SiteContent>({
    logoUrl: '',
    logoSize: 'medium',
    storeName: 'Notre Boutique',
    announcementText: 'Livraison gratuite à partir de 110 DT d\'achat 🚚'
  })
  const { getCartCount } = useCart()
  const cartCount = getCartCount()
  const prevCountRef = useRef(cartCount)

  // Fetch categories on mount
  useEffect(() => {
    async function fetchData() {
      setCategoriesLoading(true)
      setCategoriesError(false)
      
      try {
        const { data, error } = await supabase
          .from('product_types')
          .select('id, name, parent_id')
          .order('name')
        
        if (error) throw error
        
        if (data) {
          // Build tree structure with unlimited depth
          const buildTree = (parentId: string | null): Category[] => {
            return data
              .filter(c => c.parent_id === parentId)
              .map(c => ({
                ...c,
                children: buildTree(c.id)
              }))
          }
          setCategories(buildTree(null))
        }
      } catch (e) {
        console.error('Failed to fetch categories:', e)
        setCategoriesError(true)
      } finally {
        setCategoriesLoading(false)
      }

      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'site_content')
          .maybeSingle()
        
        if (data?.value) {
          const parsed = JSON.parse(data.value)
          setSiteContent(prev => ({ ...prev, ...parsed }))
        }
      } catch (e) {
        // Use defaults
      }
    }
    fetchData()
  }, [])

  // Animate badge when cart count increases
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setBadgeAnimate(true)
      const timer = setTimeout(() => setBadgeAnimate(false), 600)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = cartCount
  }, [cartCount])

  const toggleMobileExpand = (id: string) => {
    setExpandedMobileIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setExpandedMobileIds(new Set())
  }

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Produits' },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary-600 text-white text-center py-2 px-4 text-sm fixed top-0 left-0 right-0 z-50">
        {siteContent.announcementText}
      </div>

      {/* Main Header */}
      <nav className="fixed top-8 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/logo dunes.png" 
                alt="Dunes d'Or" 
                className="h-10 w-auto object-contain"
              />
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Dunes d'Or</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  if (searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                  }
                }}
                className="relative w-full"
              >
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-primary-300 focus:outline-none transition text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Cart + Mobile Menu */}
            <div className="flex items-center gap-2">
              <Link
                href="/checkout"
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Panier"
              >
                <ShoppingCart className={`h-5 w-5 transition-transform ${badgeAnimate ? 'scale-110' : ''}`} />
                {cartCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center transition-all duration-300 ${
                    badgeAnimate 
                      ? 'bg-green-500 scale-125' 
                      : 'bg-primary-600'
                  }`}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Categories Bar - Single "All Categories" Button Only */}
        <div className="hidden md:block border-t bg-white relative z-40 shadow-sm" style={{ overflow: 'visible' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
            <div className="flex items-center gap-4 py-2" style={{ overflow: 'visible' }}>
              {/* All Categories Mega Menu */}
              <div className="relative group/mega">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition whitespace-nowrap rounded-lg">
                  <LayoutGrid className="h-4 w-4" />
                  Toutes les Catégories
                  <ChevronDown className="h-3 w-3 transition-transform group-hover/mega:rotate-180" />
                </button>
                
                {/* Mega Menu Dropdown */}
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-200" style={{ zIndex: 9999 }}>
                  <div className="bg-white shadow-2xl border rounded-xl p-4 min-w-[750px] max-h-[75vh] overflow-visible">
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        <span className="ml-3 text-sm text-gray-500">Chargement...</span>
                      </div>
                    ) : categoriesError ? (
                      <div className="flex items-center justify-center py-8 text-red-500">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">Erreur de chargement des catégories</span>
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="py-8 text-center text-gray-500 text-sm">
                        Aucune catégorie disponible
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4" style={{ overflow: 'visible' }}>
                        {categories.map((category) => (
                          <div key={category.id} className="min-w-0" style={{ overflow: 'visible' }}>
                            <Link
                              href={`/products?category=${encodeURIComponent(category.name)}`}
                              className="block font-semibold text-gray-900 hover:text-primary-600 transition-colors py-2 border-b border-gray-100 mb-2 truncate"
                            >
                              {category.name}
                            </Link>
                            {category.children && category.children.length > 0 && (
                              <div className="space-y-0.5" style={{ overflow: 'visible' }}>
                                {category.children.map((sub) => (
                                  <CategoryMenuItem 
                                    key={sub.id} 
                                    category={sub}
                                    level={1}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* View All Products Link */}
                    <div className="mt-4 pt-4 border-t">
                      <Link
                        href="/products"
                        className="block text-center py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        Voir tous les produits →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Category Links with Hover Dropdowns */}
              <div className="flex items-center gap-1 overflow-visible">
                {!categoriesLoading && categories.slice(0, 6).map((category) => (
                  <div key={category.id} className="relative group/cat">
                    <Link
                      href={`/products?category=${encodeURIComponent(category.name)}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {category.name}
                      {category.children && category.children.length > 0 && (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Link>
                    {/* Dropdown for subcategories */}
                    {category.children && category.children.length > 0 && (
                      <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-150 z-[100]">
                        <div className="bg-white shadow-xl border rounded-lg py-2 min-w-52 max-h-96 overflow-y-auto">
                          {category.children.map((sub) => (
                            <div key={sub.id} className="relative group/sub">
                              <Link
                                href={`/products?category=${encodeURIComponent(sub.name)}`}
                                className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                              >
                                {sub.name}
                                {sub.children && sub.children.length > 0 && (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </Link>
                              {/* Sub-subcategories */}
                              {sub.children && sub.children.length > 0 && (
                                <div className="absolute left-full top-0 ml-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-150 z-[110]">
                                  <div className="bg-white shadow-xl border rounded-lg py-2 min-w-48 max-h-80 overflow-y-auto">
                                    {sub.children.map((subsub) => (
                                      <Link
                                        key={subsub.id}
                                        href={`/products?category=${encodeURIComponent(subsub.name)}`}
                                        className="block px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                                      >
                                        {subsub.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t max-h-[70vh] overflow-y-auto">
            <div className="py-2">
              {/* Search Bar - Mobile */}
              <div className="px-4 pb-3 border-b border-gray-100">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (searchQuery.trim()) {
                      closeMobileMenu()
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                    }
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-primary-300 focus:outline-none transition text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </form>
              </div>

              {/* Nav Links */}
              <div className="px-4 py-2 border-b border-gray-100">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block py-3 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Categories - Recursive with unlimited depth */}
              <div className="pt-2">
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégories</span>
                </div>
                
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">Chargement...</span>
                  </div>
                ) : categoriesError ? (
                  <div className="flex items-center justify-center py-6 text-red-500 px-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Erreur de chargement</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-sm px-4">
                    Aucune catégorie
                  </div>
                ) : (
                  <div>
                    {categories.map((category) => (
                      <MobileCategoryItem
                        key={category.id}
                        category={category}
                        level={0}
                        expandedIds={expandedMobileIds}
                        onToggleExpand={toggleMobileExpand}
                        onNavigate={closeMobileMenu}
                      />
                    ))}
                  </div>
                )}
                
                {/* View All Products */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <Link
                    href="/products"
                    onClick={closeMobileMenu}
                    className="block w-full py-2.5 text-center bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Voir tous les produits
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Categories Bar (below header) - Single button only */}
      <div className="md:hidden fixed top-[88px] left-0 right-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={() => setShowCategoriesPopup(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <LayoutGrid className="h-4 w-4" />
            Toutes les Catégories
            <ChevronDown className="h-3 w-3" />
          </button>
          <Link
            href="/products"
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Tous les Produits
          </Link>
        </div>
      </div>
      
      {/* Categories Popup */}
      <CategoriesPopup 
        isOpen={showCategoriesPopup} 
        onClose={() => setShowCategoriesPopup(false)} 
      />
    </>
  )
}
