# ShopEase - E-Commerce Web Application

A fully responsive e-commerce web application built with Next.js, TailwindCSS, and Supabase. Features a client-side cart system with localStorage persistence and pay-on-delivery checkout.

## 🚀 Features

### Customer Features
- **Product Catalog** - Browse products with search and category filters
- **Product Details** - Detailed product pages with image, description, and stock status
- **Shopping Cart** - Persistent cart using localStorage (no login required)
- **Cart Drawer** - Quick cart access from any page
- **Checkout** - Simple form with customer details
- **Pay on Delivery** - No online payment required

### Admin Features
- **Dashboard** - Overview of orders, revenue, and products
- **Order Management** - View, filter, and update order statuses
- **Product Management** - Add, edit, and delete products
- **Responsive Admin Panel** - Works on desktop and tablet

## 📱 Responsive Design

- **Mobile** (< 640px) - Single column layouts, sticky CTAs
- **Tablet** (640-1024px) - Two column grids
- **Desktop** (1024px+) - Full multi-column layouts

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Admin only)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone and install dependencies**
```bash
cd "site ecomm full"
npm install
```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in the SQL editor
   - Copy your project URL and anon key

3. **Configure environment**
```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Create an admin user**
   - Go to Supabase Dashboard > Authentication > Users
   - Create a new user with email/password
   - In SQL Editor, add the user to admin_users table:
   ```sql
   INSERT INTO admin_users (id, email) VALUES ('user-uuid-here', 'admin@example.com');
   ```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the app**
   - Store: [http://localhost:3000](http://localhost:3000)
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── products/
│   │   ├── page.tsx          # Products catalog
│   │   └── [id]/page.tsx     # Product detail
│   ├── cart/page.tsx         # Cart page
│   ├── checkout/page.tsx     # Checkout form
│   ├── success/page.tsx      # Order confirmation
│   └── admin/
│       ├── layout.tsx        # Admin layout with sidebar
│       ├── page.tsx          # Dashboard
│       ├── login/page.tsx    # Admin login
│       ├── orders/page.tsx   # Order management
│       └── products/page.tsx # Product management
├── components/
│   ├── Navbar.tsx            # Main navigation
│   ├── Footer.tsx            # Site footer
│   ├── CartDrawer.tsx        # Slide-in cart
│   ├── ProductCard.tsx       # Product grid card
│   └── ProductSkeleton.tsx   # Loading skeleton
├── context/
│   └── CartContext.tsx       # Cart state management
├── lib/
│   └── supabase.ts           # Supabase client
└── types/
    └── index.ts              # TypeScript types
```

## 🗄️ Database Schema

### Products
- `id`, `name`, `description`, `price`, `image`, `category`, `stock`, `created_at`

### Orders
- `id`, `customer_name`, `phone`, `city`, `address`, `notes`, `total_price`, `status`, `created_at`

### Order Items (Price snapshot at checkout)
- `id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`

### Admin Users
- `id`, `email`, `created_at`

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Products: Public read, admin write
- Orders: Public create, admin read/update
- Admin authentication via Supabase Auth

## 🛒 Cart System

The cart uses a client-side first approach:
- Stored in `localStorage` for persistence
- Synced to database only on checkout
- Works without user authentication
- Instant updates with optimistic UI

## 📱 UX Highlights

- ✅ Cart persists on refresh
- ✅ Cart accessible from every page
- ✅ Checkout < 60 seconds
- ✅ Fully mobile responsive
- ✅ No payment confusion (Pay on Delivery)
- ✅ Admin usable on tablet

## 🚀 Deployment

Deploy to Vercel:
```bash
npm run build
# or push to GitHub and connect to Vercel
```

## 📝 License

MIT License
