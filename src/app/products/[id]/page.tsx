'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Minus, Plus, ShoppingCart, Shield } from 'lucide-react'
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
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-8">
        {/* Back Link - with minimum 20px spacing from navbar */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 mt-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={product.image || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-primary-600 font-medium uppercase tracking-wide mb-2">
              {product.product_type?.name || 'عام'}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary-600 mb-6">
              {product.price.toFixed(2)} د.ت
            </p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  متوفر ({product.stock} قطعة)
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  نفذ من المخزون
                </span>
              )}
            </div>

            {/* Dynamic Product Options */}
            {formFields.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
              <span className="text-gray-700 font-medium">الكمية:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              className="w-full btn-primary flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              أضف إلى السلة
            </button>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="h-5 w-5 text-primary-600" />
                <span>الدفع عند الاستلام - لا يتطلب دفع مسبق</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
