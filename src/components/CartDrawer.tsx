'use client'

import { useCart } from '@/context/CartContext'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatOptionsForDisplay } from '@/components/DynamicFormField'

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal } = useCart()

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            سلة التسوق ({items.length})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="إغلاق السلة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">سلتك فارغة</p>
              <p className="text-sm">أضف بعض المنتجات للبدء</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const optionsList = formatOptionsForDisplay(item.options || {})
                return (
                  <div key={item.optionsKey} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      {optionsList.length > 0 && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {optionsList.map((opt, idx) => (
                            <span key={idx} className="block truncate">{opt}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-primary-600 font-semibold">{item.price.toFixed(2)} د.ت</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.optionsKey, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.optionsKey, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.optionsKey)}
                          className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors ml-auto"
                          aria-label="إزالة المنتج"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>المجموع</span>
              <span className="text-primary-600">{getCartTotal().toFixed(2)} د.ت</span>
            </div>
            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm">
              💵 الدفع عند الاستلام - لا يتطلب دفع مسبق
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary text-center"
              >
                عرض السلة
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="btn-primary text-center"
              >
                إتمام الشراء
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
