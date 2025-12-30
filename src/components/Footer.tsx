import { Store, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Store className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold text-white">متجرنا</span>
            </Link>
            <p className="text-sm text-gray-400">
              منتجات عالية الجودة تصل إلى باب منزلك. ادفع عند الاستلام، بدون متاعب.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-primary-400 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-primary-400 transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm hover:text-primary-400 transition-colors">
                  السلة
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary-400" />
                <span dir="ltr">+216 12 345 678</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary-400" />
                <span dir="ltr">support@matjarna.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary-400 mt-0.5" />
                <span>شارع التجارة، المدينة</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">الدعم</h3>
            <p className="text-sm text-gray-400">
              نحن هنا لمساعدتك. تواصل معنا لأي استفسار.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col items-center gap-4">
            <Link 
              href="/store-admin-panel/login"
              className="px-6 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              دخول المسؤول
            </Link>
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} متجرنا. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
