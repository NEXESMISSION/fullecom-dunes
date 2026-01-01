'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { ArrowLeft, Loader2, CheckCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'
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
  const { items, getCartTotal, clearCart, updateQuantity, removeFromCart } = useCart()
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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
      // Prepare order data for API
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim() || null,
        total_price: Number(getCartTotal().toFixed(2)),
        items: items.map(item => ({
          product_id: item.product_id || null,
          product_name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          options: item.options && Object.keys(item.options).length > 0 ? item.options : null,
        }))
      }

      // Call API route with retry for mobile networks
      const result = await retryOperation(async () => {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderPayload),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'فشل في إنشاء الطلب')
        }

        if (!data.orderId) {
          throw new Error('لم يتم إرجاع معرف الطلب')
        }

        return data
      })

      // Success - clear cart and redirect
      setOrderSuccess(result.orderId)
      clearCart()
      
      setTimeout(() => {
        router.push(`/success?order=${result.orderId}`)
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Compact Order Summary - At Top */}
      <div className="bg-primary-600 text-white rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">🛒 ملخص الطلب ({items.length} منتج)</h2>
          <span className="text-xl font-bold">{getCartTotal().toFixed(2)} د.ت</span>
        </div>
        
        {/* Compact items list */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {items.map(item => {
            const optionsList = formatOptionsForDisplay(item.options || {})
            return (
              <div key={item.optionsKey} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="text-white/70">×{item.quantity}</span>
                  </div>
                  {optionsList.length > 0 && (
                    <div className="text-xs text-white/70 mt-0.5 flex flex-wrap gap-1">
                      {optionsList.map((opt, idx) => (
                        <span key={idx} className="bg-white/20 px-1.5 py-0.5 rounded">{opt}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mr-2">
                  <span className="font-semibold whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} د.ت</span>
                  <button
                    onClick={() => removeFromCart(item.optionsKey)}
                    className="p-1 hover:bg-white/20 rounded transition"
                    title="حذف"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20 text-sm">
          <span>التوصيل: <span className="text-green-300">مجاني</span></span>
          <Link href="/products" className="text-white/80 hover:text-white underline text-xs">
            + إضافة منتجات
          </Link>
        </div>
      </div>

      {/* Back Link */}
      <Link
        href="/products"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4 text-sm"
      >
        <ArrowLeft className="h-4 w-4 ml-1" />
        متابعة التسوق
      </Link>

      {/* Customer Form - Clean & Compact */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 معلومات التوصيل</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="أدخل اسمك"
              />
              {errors.customer_name && (
                <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
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
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
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
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              عنوان التوصيل *
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className={`input-field ${errors.address ? 'border-red-500' : ''}`}
              placeholder="أدخل عنوان التوصيل الكامل"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات (اختياري)
            </label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              placeholder="أي تعليمات خاصة للتوصيل"
            />
          </div>

          <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex items-center gap-2">
            <span className="text-lg">💵</span>
            <div>
              <p className="font-medium">الدفع عند الاستلام</p>
              <p className="text-xs text-amber-700">ادفع نقداً عند استلام طلبك</p>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm">
              <p className="font-medium">❌ {errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>تأكيد الطلب - {getCartTotal().toFixed(2)} د.ت</>
            )}
          </button>
        </form>
      </div>

      {/* Continue Shopping */}
      <div className="mt-6 text-center">
        <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          ← تصفح المزيد من المنتجات
        </Link>
      </div>
    </div>
  )
}
