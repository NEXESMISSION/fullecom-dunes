'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Minus, Plus, ShoppingCart, Shield, Truck, CreditCard, ChevronLeft, ChevronRight, Check, Star, Heart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Footer from '@/components/Footer'
import { Product, ProductOptions, FormField } from '@/types'
import { supabase } from '@/lib/supabase'
import { DynamicProductForm, validateProductOptions } from '@/components/DynamicFormField'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [productOptions, setProductOptions] = useState<ProductOptions>({})
  const [optionErrors, setOptionErrors] = useState<{ [key: string]: string }>({})
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageZoomed, setIsImageZoomed] = useState(false)

  const formFields: FormField[] = product?.product_type?.form_schema?.fields || []
  
  // Get all images - prioritize images array, fallback to single image
  const allImages: string[] = product ? [
    ...(product.images && product.images.length > 0 ? product.images : []),
    ...(product.image && (!product.images || !product.images.includes(product.image)) ? [product.image] : [])
  ].filter(Boolean) : []

  // Ensure we have at least a placeholder
  const displayImages = allImages.length > 0 ? allImages : ['/placeholder.png']

  useEffect(() => {
    async function fetchProduct() {
      const productId = params.id as string
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_type:product_types(*)
          `)
          .eq('id', productId)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (error) {
        console.error('Failed to fetch product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])
  
  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length)
  }
  
  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleOptionChange = (fieldId: string, value: string | number | boolean | string[]) => {
    setProductOptions(prev => ({ ...prev, [fieldId]: value }))
    // Clear error when user changes value
    if (optionErrors[fieldId]) {
      setOptionErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    // Validate options if product has form fields
    if (formFields.length > 0) {
      const { isValid, errors } = validateProductOptions(formFields, productOptions)
      if (!isValid) {
        setOptionErrors(errors)
        toast.error('Veuillez remplir toutes les options requises')
        return
      }
    }

    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      options: productOptions,
    }, quantity)
    
    // Show success toast - small, fast, bottom position
    toast.success('Ajouté au panier!', {
      duration: 1500,
      position: 'bottom-center',
      style: {
        background: '#002366',
        color: '#fff',
        fontSize: '13px',
        padding: '8px 16px',
        borderRadius: '8px',
      },
    })
    
    // Reset options after adding
    setProductOptions({})
    setOptionErrors({})
    setQuantity(1)
  }

  const isAddToCartDisabled = product?.stock === 0

  // Calculate discount percentage
  const discountPercent = product?.original_price && product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[60px] sm:pt-[72px] pb-16">
          <div className="animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded-full mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl" />
                <div className="flex gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl" />)}
                </div>
              </div>
              <div className="space-y-6 py-4">
                <div className="h-5 w-28 bg-gray-200 rounded-full" />
                <div className="h-10 w-4/5 bg-gray-200 rounded-lg" />
                <div className="h-8 w-40 bg-gray-200 rounded-lg" />
                <div className="h-24 bg-gray-200 rounded-lg" />
                <div className="h-14 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Produit introuvable</h1>
          <p className="text-gray-500 mb-8 max-w-md">Ce produit n'existe pas ou a été supprimé.</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour aux produits
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[60px] sm:pt-[72px] pb-16">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux produits
          </Link>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image Container */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
              <Image
                src={displayImages[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              
              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                  -{discountPercent}%
                </div>
              )}
              
              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {selectedImageIndex + 1} / {displayImages.length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white border-2 transition-all duration-200 ${
                      index === selectedImageIndex 
                        ? 'border-primary-600 shadow-lg shadow-primary-600/20 scale-105' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <Image 
                      src={img} 
                      alt={`${product.name} - Image ${index + 1}`} 
                      fill 
                      className="object-contain p-1" 
                      sizes="80px" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:py-4">
            {/* Category */}
            {product.product_type?.name && (
              <Link 
                href={`/products?category=${product.product_type_id}`}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-full mb-4 transition-colors"
              >
                {product.product_type.name}
              </Link>
            )}
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            {/* Price Section */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-primary-600">
                {product.price.toFixed(2)} <span className="text-xl">DT</span>
              </span>
              {product.original_price && product.original_price > product.price && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg text-gray-400 line-through">
                    {product.original_price.toFixed(2)} DT
                  </span>
                  <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                    Économisez {(product.original_price - product.price).toFixed(2)} DT
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    En stock • {product.stock} disponible{product.stock > 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-red-700">Rupture de stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <p className="text-gray-600 leading-relaxed text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Divider */}
            <hr className="border-gray-100 mb-6" />

            {/* Dynamic Product Options */}
            {formFields.length > 0 && (
              <div className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Options du produit</h3>
                <DynamicProductForm
                  fields={formFields}
                  values={productOptions}
                  onChange={handleOptionChange}
                  errors={optionErrors}
                />
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantité:</span>
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
                className="w-full h-14 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-600/25 hover:shadow-2xl hover:shadow-primary-600/30"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Ajouter au panier</span>
                <span className="text-primary-200">•</span>
                <span>{(product.price * quantity).toFixed(2)} DT</span>
              </button>
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Livraison rapide</p>
                  <p className="text-xs text-gray-500">Partout en Tunisie</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Paiement à la livraison</p>
                  <p className="text-xs text-gray-500">Payez à la réception</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Garantie qualité</p>
                  <p className="text-xs text-gray-500">Produit authentique</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
