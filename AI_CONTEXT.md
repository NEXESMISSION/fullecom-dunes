# Project: E-commerce Storefront (COD Only)

## Goal
Single-tenant e-commerce storefront with:
- Product catalog with categories
- Direct checkout (no separate cart page)
- Cash on Delivery (COD) only
- Admin dashboard for full store management
- Arabic RTL localization (Tunisia)

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase
- **Auth**: Supabase Auth (admin only)
- **DB**: PostgreSQL (via Supabase)
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Notifications**: react-hot-toast

## Core Rules
- **No online payments** - COD only
- **No user accounts** - customers checkout as guests
- **Orders = form submission** with customer info
- **Currency**: TND (Tunisian Dinar)
- **Language**: Arabic (RTL layout)

## Folder Structure
```
/src
  /app
    /page.tsx              → Landing page
    /products              → Products listing
    /products/[id]         → Product detail
    /checkout              → Checkout (merged cart)
    /success               → Order confirmation
    /cart                  → Redirects to /checkout
    /store-admin-panel     → Admin dashboard
      /login               → Admin login
      /orders              → Order management
      /products            → Product CRUD
      /product-types       → Categories
      /banners             → Promotional banners
      /promo-images        → Promo image grid
      /landing             → Landing page sections
      /site-content        → All site text & branding
    /api/orders            → Server-side order creation
  /components
    /Navbar.tsx            → Header with dynamic logo
    /Footer.tsx            → Footer with dynamic content
    /ProductCard.tsx       → Product display card
    /CartDrawer.tsx        → (Legacy - unused)
  /context
    /CartContext.tsx       → Cart state management
  /lib
    /supabase.ts           → Supabase client
  /types
    /index.ts              → TypeScript interfaces
```

## Database Tables
| Table | Purpose |
|-------|---------|
| `products` | Product catalog |
| `product_types` | Categories (with images) |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `admin_users` | Admin authentication |
| `banners` | Promotional banners (size + height control) |
| `promo_images` | Promotional image grid |
| `site_settings` | Key-value store for all settings |

## Site Settings Keys
| Key | Content |
|-----|---------|
| `hero_background` | Hero section background (gradient/color/image) |
| `landing_config` | Section visibility & titles |
| `site_content` | All text: logo, hero, CTA, footer |

## Key Interfaces
```typescript
Product {
  id: uuid
  name: string
  price: number
  description: string
  images: string[]
  product_type_id: uuid
  is_active: boolean
  options: ProductOption[]
}

Order {
  id: uuid
  customer_name: string
  phone: string
  city: string
  address: string
  notes?: string
  total_price: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
}

SiteContent {
  logoUrl: string
  logoSize: 'small' | 'medium' | 'large'
  storeName: string
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  ctaTitle: string
  ctaSubtitle: string
  ctaButtonText: string
  footerDescription: string
  footerPhone: string
  footerEmail: string
  footerAddress: string
  footerSupportText: string
}
```

## Context Zones
| Zone | Scope |
|------|-------|
| **Storefront** | Landing, products, checkout |
| **Cart** | Cart context, checkout flow |
| **Admin** | Dashboard, CRUD operations |
| **Content** | Site settings, branding |
| **Orders** | Order creation, status management |

## Recent Decisions
- Cart page removed → merged into checkout
- Full site content controllable from admin
- Navbar/Footer fetch their own siteContent
- Skeleton loading prevents content flash
- Prefetch enabled for fast admin navigation

## GitHub
Repository: `https://github.com/NEXESMISSION/fullecom-dunes.git`
