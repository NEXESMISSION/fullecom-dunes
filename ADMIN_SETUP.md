# 🔐 Admin Panel Setup Guide

## Quick Access
- **Admin Login:** http://localhost:3000/manage-store-x7k9/login
- **Admin Dashboard:** http://localhost:3000/manage-store-x7k9

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Run Migration Script
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy ALL content from `supabase/migration.sql`
3. Paste and click **RUN**
4. Wait for "Migration completed successfully!"

### Step 2: Create Admin User in Supabase Auth
1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **"Add User"** → **"Create New User"**
3. Fill in:
   - Email: `admin@yourstore.com` (or any email you want)
   - Password: `YourSecurePassword123!` (choose a strong password)
   - **Auto Confirm User:** ✅ Check this box
4. Click **Create User**
5. **COPY THE USER ID** (UUID) from the users list

### Step 3: Grant Admin Access
In Supabase SQL Editor, run this (replace with YOUR values):

```sql
INSERT INTO admin_users (id, email) 
VALUES ('PASTE-YOUR-USER-UUID-HERE', 'admin@yourstore.com');
```

**Example:**
```sql
INSERT INTO admin_users (id, email) 
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@yourstore.com');
```

---

## ✅ Test Login

1. Go to: http://localhost:3000/manage-store-x7k9/login
2. Enter your email and password
3. Click "Sign In"

You should be redirected to the admin dashboard!

---

## 🐛 Troubleshooting

### "Login stuck on loading"
- **Check browser console** (F12) for errors
- Make sure you ran the migration script
- Verify the admin_users table exists

### "You are not authorized"
- Make sure you added your user to `admin_users` table
- Check the UUID matches exactly (no spaces)
- Run this to verify:
  ```sql
  SELECT * FROM admin_users;
  ```

### "Invalid login credentials"
- Email/password is wrong
- Check in Supabase Dashboard → Authentication → Users
- Try resetting the password

### "Policy error" or "RLS error"
- Run the migration script again
- It will drop and recreate all policies safely

---

## 📊 Verify Everything Works

Run these SQL queries to check:

```sql
-- Check if admin_users table exists
SELECT * FROM admin_users;

-- Check if you're in the admin list
SELECT * FROM admin_users WHERE email = 'your-email@example.com';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'admin_users';
```

---

## 🔒 Security Notes

- Admin route is hidden at `/manage-store-x7k9` (not `/admin`)
- Only users in `admin_users` table can access
- RLS policies prevent unauthorized access
- Sessions are verified on every page load

---

## 📝 Default Test Credentials (After Setup)

After you complete the setup, you can login with:
- **Email:** The email you created in Step 2
- **Password:** The password you set in Step 2

**Remember to change these in production!**
