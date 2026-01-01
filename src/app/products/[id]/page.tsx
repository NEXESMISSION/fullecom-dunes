'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Minus, Plus, ShoppingCart, Shield, Truck, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
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

  const formFields: FormField[] = product?.product_type?.form_schema?.fields || []
  
  // Get all images (combine image and images array)
  const allImages: string[] = product ? [
    ...(product.images && product.images.length > 0 ? product.images : []),
    ...(product.image && (!product.images || !product.images.includes(product.image)) ? [product.image] : [])
  ].filter(Boolean) : []

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
    
    // Reset options after adding
    setProductOptions({})
    setOptionErrors({})
    setQuantity(1)
  }

  const isAddToCartDisabled = product?.stock === 0

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-8">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit introuvable</h1>
        <p className="text-gray-500 mb-8">Ce produit n'existe pas ou a été supprimé.</p>
        <Link href="/products" className="btn-primary inline-block">
          Retour aux produits
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-12">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Link>

        {/* Product Details Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={allImages[selectedImageIndex] || product.image || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}
                {/* Image Counter */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    {selectedImageIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex ? 'border-primary-600 ring-2 ring-primary-200' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-8 lg:p-10 lg:border-l border-gray-100">
              {/* Category Badge */}
              {product.product_type?.name && (
                <span className="inline-block px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full mb-4">
                  {product.product_type.name}
                </span>
              )}
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-primary-600">
                  {product.price.toFixed(2)} DT
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {product.original_price.toFixed(2)} DT
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Rupture de stock
                  </span>
                )}
              </div>

              {/* Dynamic Product Options */}
              {formFields.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <DynamicProductForm
                    fields={formFields}
                    values={productOptions}
                    onChange={handleOptionChange}
                    errors={optionErrors}
                  />
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium">Quantité:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors rounded-l-xl"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-14 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-gray-100 transition-colors rounded-r-xl"
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
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl flex items-center justify-center gap-3 mb-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
              >
                <ShoppingCart className="h-5 w-5" />
                Ajouter au panier
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Truck className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-sm">Livraison rapide</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-sm">Paiement à la livraison</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Shield className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-sm">Produit garanti</span>
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
