# E-commerce Store Portfolio Project

A modern, fully-featured e-commerce web application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Register, login, and profile management
- **Product Browsing**: View products by category, search, and filtering
- **Shopping Cart**: Add products, update quantities, and remove items
- **Wishlist/Favorites**: Save products for later
- **Checkout Process**: Complete purchases with mock payment processing
- **Order Management**: View order history and check order status
- **Admin Dashboard**: Manage products, orders, and customers (admin-only)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**:
  - React 18 (with TypeScript)
  - Vite (for fast development and optimized builds)
  - React Router v6 (for routing)
  - Zustand (for state management)
  - Tailwind CSS (for styling)
  - Headless UI (for accessible UI components)
  - Heroicons (for icons)
  - React Hot Toast (for notifications)

- **Backend**:
  - Supabase (for authentication, database, and storage)
  - PostgreSQL (database)
  - Row-Level Security (for data protection)

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── api/             # API service functions
│   ├── components/      # Reusable components
│   │   ├── layout/      # Layout components (header, footer)
│   │   ├── product/     # Product-related components
│   │   ├── cart/        # Cart-related components
│   │   ├── checkout/    # Checkout-related components
│   │   ├── admin/       # Admin-only components
│   │   └── ui/          # UI components (buttons, cards, modals)
│   ├── pages/           # Page components
│   │   └── admin/       # Admin pages
│   ├── store/           # Zustand store definitions
│   ├── types/           # TypeScript type definitions
│   ├── lib/             # Utility libraries
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
├── supabase/            # Supabase configuration and schema
├── .env.example         # Example environment variables
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/e-commerce-portfolio.git
   cd e-commerce-portfolio
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn
   ```

3. Create a `.env` file based on `.env.example` and add your Supabase credentials

4. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Setting up Supabase

1. Create a new Supabase project
2. Run the SQL scripts from the `supabase/` directory to set up the database schema
3. Configure authentication providers (email/password at minimum)
4. Create storage buckets for product images
5. Update your `.env` file with your Supabase URL and anon key

## Deployment

### Frontend Deployment (Vercel)

1. Push your repository to GitHub
2. Create a new Vercel project from the GitHub repository
3. Add environment variables in the Vercel project settings
4. Deploy!

### Supabase Backend

- Your Supabase project is already deployed on their infrastructure. No additional steps required.

## Mock Data

For portfolio demonstration purposes, you can use the seed data provided in the SQL scripts to populate your database with sample products, categories, and users.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Headless UI](https://headlessui.dev/)
- [Heroicons](https://heroicons.com/) 