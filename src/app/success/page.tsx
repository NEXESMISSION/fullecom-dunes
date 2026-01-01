'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Phone, ArrowRight } from 'lucide-react'
import { Suspense, useEffect } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">تم تأكيد الطلب بنجاح!</h1>
        <p className="text-gray-500 mb-6">
          شكراً لطلبك. سنتصل بك قريباً لتأكيد التوصيل.
        </p>

        {orderId && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">رقم الطلب</p>
            <p className="font-mono font-medium text-gray-900" dir="ltr">{orderId}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 text-left space-y-4 mb-8">
          <h2 className="font-semibold text-gray-900">ماذا بعد؟</h2>

          <div className="flex items-start gap-3">
            <div className="bg-primary-100 rounded-full p-2 flex-shrink-0">
              <Phone className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">مكالمة التأكيد</p>
              <p className="text-sm text-gray-500">
                سنتصل بك لتأكيد طلبك وتفاصيل التوصيل.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary-100 rounded-full p-2 flex-shrink-0">
              <Package className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">توصيل سريع</p>
              <p className="text-sm text-gray-500">
                سيتم توصيل طلبك خلال 2-5 أيام عمل.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm">
            💵 تذكر: ادفع نقداً عند استلام طلبك.
          </div>
        </div>

        <Link
          href="/products"
          className="btn-primary inline-flex items-center gap-2"
        >
          تابع التسوق
          <ArrowRight className="h-5 w-5 rotate-180" />
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
