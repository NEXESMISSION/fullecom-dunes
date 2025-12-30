'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatOptionsForDisplay } from '@/components/DynamicFormField'

interface FormData {
  customer_name: string
  phone: string
  city: string
  address: string
  notes: string
}

interface FormErrors {
  customer_name?: string
  phone?: string
  city?: string
  address?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getCartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  
  // Store cart data before clearing
  const cartDataRef = useRef<{ items: typeof items; total: number } | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'الاسم مطلوب'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب'
    } else if (!/^[+]?[\d\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'يرجى إدخال رقم هاتف صحيح'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'المدينة مطلوبة'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Retry function for network issues
  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> => {
    let lastError: Error | null = null
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }
    throw lastError
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!validateForm()) return
    if (items.length === 0) {
      setErrorMessage('سلتك فارغة')
      return
    }

    // Store cart data before any async operations
    cartDataRef.current = { items: [...items], total: getCartTotal() }
    setLoading(true)

    try {
      // Prepare order data - keep it simple
      const orderData = {
        customer_name: formData.customer_name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim() || null,
        total_price: Number(getCartTotal().toFixed(2)),
        status: 'pending',
      }

      // Create order with retry for mobile networks
      const order = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('orders')
          .insert(orderData)
          .select('id')
          .single()

        if (error) {
          console.error('Supabase order error:', JSON.stringify(error, null, 2))
          // Show detailed error for debugging
          const details = error.message || error.code || 'Unknown error'
          throw new Error(`خطأ قاعدة البيانات: ${details}`)
        }

        if (!data?.id) {
          throw new Error('لم يتم إرجاع معرف الطلب')
        }

        return data
      })

      // Create order items (simplified - no product_id foreign key issues)
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || null,
        product_name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        options: item.options && Object.keys(item.options).length > 0 ? item.options : null,
      }))

      try {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('Items error:', JSON.stringify(itemsError, null, 2))
          // Don't fail the order if items fail - order was already created
        }
      } catch (itemErr) {
        console.error('Items insert exception:', itemErr)
      }

      // Success - clear cart and redirect
      setOrderSuccess(order.id)
      clearCart()
      
      setTimeout(() => {
        router.push(`/success?order=${order.id}`)
      }, 100)
      
    } catch (error) {
      console.error('Order creation failed:', error)
      let message = 'فشل في إنشاء الطلب'
      
      if (error instanceof Error) {
        message = error.message
      }
      
      // Check for network errors
      if (String(error).includes('fetch') || String(error).includes('network')) {
        message = 'خطأ في الاتصال. تأكد من اتصالك بالإنترنت'
      }
      
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrorMessage(null)
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // Show success state after order is placed
  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">تم إرسال طلبك بنجاح!</h2>
        <p className="text-gray-600 mb-4">جاري تحويلك لصفحة التأكيد...</p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">سلتك فارغة</h1>
        <p className="text-gray-500 mb-8">أضف بعض المنتجات قبل إتمام الشراء.</p>
        <Link href="/products" className="btn-primary inline-block">
          تصفح المنتجات
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/cart"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-8"
      >
        <ArrowLeft className="h-4 w-4 ml-2" />
        العودة إلى السلة
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">إتمام الشراء</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Customer Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">معلومات التوصيل</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className={`input-field ${errors.customer_name ? 'border-red-500' : ''}`}
                  placeholder="أدخل اسمك الكامل"
                />
                {errors.customer_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+216 12 345 678"
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  المدينة *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="أدخل مدينتك"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان التوصيل *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="أدخل عنوان التوصيل الكامل"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات الطلب (اختياري)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="أي تعليمات خاصة للتوصيل"
                />
              </div>

              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
                <p className="font-medium">💵 الدفع عند الاستلام</p>
                <p className="text-sm mt-1">
                  لا يتطلب دفع الآن. ادفع نقداً عند استلام طلبك.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                  <p className="font-medium">❌ {errorMessage}</p>
                  <p className="text-sm mt-1">يرجى المحاولة مرة أخرى أو التواصل معنا.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  'تأكيد الطلب'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص الطلب</h2>

            <div className="divide-y max-h-64 overflow-y-auto">
              {items.map(item => {
                const optionsList = formatOptionsForDisplay(item.options || {})
                return (
                  <div key={item.optionsKey} className="py-3 flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      {optionsList.length > 0 && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {optionsList.map((opt, idx) => (
                            <span key={idx} className="block">{opt}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                      <p className="text-sm font-medium text-primary-600">
                        {(item.price * item.quantity).toFixed(2)} د.ت
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span>{getCartTotal().toFixed(2)} د.ت</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">التوصيل</span>
                <span className="text-green-600">مجاني</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>المجموع</span>
                <span className="text-primary-600">{getCartTotal().toFixed(2)} د.ت</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
