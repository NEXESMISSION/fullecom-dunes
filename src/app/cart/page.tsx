'use client'

import { useCart } from '@/context/CartContext'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { formatOptionsForDisplay } from '@/components/DynamicFormField'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">سلتك فارغة</h1>
            <p className="text-gray-500 mb-8">يبدو أنك لم تضف أي منتجات بعد.</p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              تابع التسوق
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">سلة التسوق</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {items.map((item, index) => {
                const optionsList = formatOptionsForDisplay(item.options || {})
                return (
                  <div
                    key={item.optionsKey}
                    className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 ${
                      index !== items.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <Link href={`/products/${item.product_id}`} className="flex-shrink-0">
                      <div className="relative w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product_id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      {/* Display selected options */}
                      {optionsList.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {optionsList.map((opt, idx) => (
                            <p key={idx} className="text-sm text-gray-500">{opt}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-lg font-bold text-primary-600 mt-1">
                        {item.price.toFixed(2)} د.ت
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.optionsKey, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            aria-label="تقليل الكمية"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.optionsKey, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} د.ت
                          </span>
                          <button
                            onClick={() => removeFromCart(item.optionsKey)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="إزالة المنتج"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-6 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowRight className="h-4 w-4" />
              تابع التسوق
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص الطلب</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي ({items.length} منتج)</span>
                  <span className="font-medium">{getCartTotal().toFixed(2)} د.ت</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التوصيل</span>
                  <span className="font-medium text-green-600">مجاني</span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>المجموع</span>
                  <span className="text-primary-600">{getCartTotal().toFixed(2)} د.ت</span>
                </div>
              </div>

              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm mt-4">
                💵 الدفع عند الاستلام - لا يتطلب دفع مسبق
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                إتمام الشراء
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600">المجموع:</span>
          <span className="text-xl font-bold text-primary-600">{getCartTotal().toFixed(2)} د.ت</span>
        </div>
        <Link
          href="/checkout"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          إتمام الشراء
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="lg:hidden h-32" /> {/* Spacer for mobile sticky button */}
      <Footer />
    </div>
  )
}
