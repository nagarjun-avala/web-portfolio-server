# 🚀 Dynamic Portfolio Server

A modern, portfolio server built with Node js, featuring a comprehensive APIs for portfolio and Admin dashboard with visitor analytics, and dynamic content management.

## ✨ Features

### 📊 Admin Dashboard

- **Secure Authentication** - JWT-based login with session management
- **Analytics Dashboard** - Visitor tracking, geographic insights, and engagement metrics
- **Content Management** - Full CRUD for projects, blog posts, skills, and experience
- **Message Management** - Handle contact form submissions with status tracking
- **Real-time Updates** - Live data synchronization across all components

### 🛠️ Backend Power

- **Database-Driven** - All content stored in MongoDB with Prisma ORM
- **RESTful APIs** - Clean, documented API endpoints for all features
- **Visitor Analytics** - IP-based tracking with geographic data and caching
- **Contact System** - Form handling with spam protection and email notifications
- **Performance Optimized** - Efficient queries, caching, and data fetching

## 🏗️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **ShadCN/UI** - Component library
- **React Hook Form** - Form validation
- **Zod** - Schema validation

### Backend

- **Node.js** - JavaScript runtime
- **Prisma ORM** - Database toolkit
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Resend/Nodemailer** - Email service

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **Vercel** - Deployment platform

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Git for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/nagarjun-avala/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/portfolio"
   # or MongoDB Atlas URL:
   # DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/portfolio"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-here"
   NEXTAUTH_SECRET="your-nextauth-secret-here"

   # Email (optional - for contact form)
   RESEND_API_KEY="your-resend-api-key"
   CONTACT_EMAIL="your-email@example.com"

   # External APIs (optional)
   IPAPI_KEY="your-ipapi-key-for-geolocation"
   ```

4. **Database Setup**

   Generate Prisma client and push schema:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the Database**

   Populate with sample data:

   ```bash
   npx tsx scripts/seed.ts
   ```

6. **Create Admin User**

   Set up your admin account:

   ```bash
   npx tsx scripts/create-admin.ts
   ```

7. **Start Development Server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see your portfolio!

## 📁 Project Structure

```test

portfolio/
├── app/
│   ├── admin/                 # Admin dashboard pages
│   ├── api/                   # API routes
│   │   ├── analytics/         # Analytics endpoints
│   │   ├── contact/           # Contact form handler
│   │   ├── portfolio/         # Main portfolio data
│   │   └── visitors/          # Visitor tracking
│   ├── blog/                  # Blog pages
│   ├── components/            # React components
│   │   ├── DynamicHome.tsx
│   │   ├── DynamicSkills.tsx
│   │   ├── DynamicProjects.tsx
│   │   ├── DynamicBlog.tsx
│   │   ├── DynamicContactMe.tsx
│   │   ├── DynamicExperience.tsx
│   │   ├── AdminLoginDialog.tsx
│   │   └── VisitorCounter.tsx
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main portfolio page
├── lib/
│   └── db.ts                  # Prisma client setup
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   ├── seed.ts                # Database seeding
│   └── create-admin.ts        # Admin user creation
├── public/                    # Static assets
├── middleware.ts              # Route protection
└── package.json
```

## 🎯 Key Features Explained

### Dynamic Content Management

All content is stored in MongoDB and can be managed through the admin dashboard:

- **Profile Information** - Personal details, bio, social links
- **Skills** - Categorized with proficiency levels and descriptions
- **Projects** - Rich project data with images, demos, and tech stacks
- **Experience** - Timeline with achievements and technologies
- **Blog Posts** - Full blog system with drafts and publishing

### Visitor Analytics

- **IP-based tracking** with geographic data
- **Visit counting** for returning visitors
- **Geographic insights** showing visitor locations
- **Performance metrics** and engagement tracking

### Security Features

- **JWT authentication** for admin access
- **Password hashing** using bcrypt
- **Session management** with expiration
- **CSRF protection** and input validation
- **Honeypot fields** for spam prevention

## 🎨 Customization

### Styling

The portfolio uses a glassmorphism design with customizable colors:

- Primary: Cyan (`#06b6d4`)
- Secondary: Purple (`#8b5cf6`)
- Accent: Pink (`#ec4899`)

### Components

Each section is a separate component that can be easily customized:

- Modify layouts in `/app/components/`
- Update animations in motion variants
- Adjust responsive breakpoints

### Content

Update content through:

1. **Admin Dashboard** - `/admin` (recommended)
2. **Database directly** - Using Prisma Studio
3. **API endpoints** - Programmatic updates

## 📱 Responsive Design

The portfolio is fully responsive with:

- **Mobile-first approach** using Tailwind CSS
- **Adaptive navigation** - Floating on desktop, bottom bar on mobile
- **Touch-friendly interactions** for mobile devices
- **Optimized images** with Next.js Image component

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

```env
DATABASE_URL="your-mongodb-atlas-url"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_SECRET="your-production-nextauth-secret"
RESEND_API_KEY="your-resend-api-key"
CONTACT_EMAIL="your-email@example.com"
```

### Post-Deployment Setup

1. Run database migrations: `npx prisma db push`
2. Seed initial data: `npx tsx scripts/seed.ts`
3. Create admin user: `npx tsx scripts/create-admin.ts`

## 📖 API Documentation

### Public Endpoints

- `GET /api/portfolio` - Fetch all portfolio data
- `POST /api/contact` - Submit contact form
- `POST /api/visitors` - Track visitor (automatic)
- `GET /api/blog/[slug]` - Get blog post by slug

### Admin Endpoints (Protected)

- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/auth/verify` - Verify session
- `GET /api/analytics` - Get detailed analytics
- `CRUD /api/admin/projects` - Manage projects
- `CRUD /api/admin/blog` - Manage blog posts

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes

# Setup
npx tsx scripts/seed.ts        # Seed database
npx tsx scripts/create-admin.ts # Create admin user

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format with Prettier
```

## 🎪 Demo

- **Live Portfolio**: [https://nagarjun-avala.vercel.app](https://nagarjun-avala.vercel.app)
- **Admin Dashboard**: [https://nagarjun-avala.vercel.app/admin](https://nagarjun-avala.vercel.app/admin)

### Demo Admin Credentials

- **Username**: `admin`
- **Password**: `portfolio123`

> **Note**: Change these credentials in production!

## 🤝 Contributing

This is a personal portfolio, but feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Design Inspiration** - Modern glassmorphism trends
- **Icons** - Lucide React and React Icons
- **Animations** - Framer Motion community
- **UI Components** - ShadCN/UI library

## 📞 Contact

###

#### Nagarjun Avala

- 🌐 Portfolio: [nagarjun-avala.vercel.app](https://nagarjun-avala.vercel.app)
- 📧 Email: <nagarjun.avala.official@gmail.com>
- 💼 LinkedIn: [linkedin.com/in/nagarjun-avala](https://linkedin.com/in/nagarjun-avala)
- 🐙 GitHub: [github.com/nagarjun-avala](https://github.com/nagarjun-avala)

## 🚧 Roadmap

### Phase 1 ✅

- [x] Dynamic content management
- [x] Admin authentication
- [x] Visitor analytics
- [x] Contact form system
- [x] Responsive design

### Phase 2 🔄

- [ ] Blog commenting system
- [ ] Advanced analytics dashboard
- [ ] Email newsletter integration
- [ ] Multi-language support
- [ ] Performance optimization

### Phase 3 📋

- [ ] CMS integration (Strapi/Sanity)
- [ ] Real-time notifications
- [ ] Advanced SEO features
- [ ] Progressive Web App (PWA)
- [ ] A/B testing framework

---

⭐ **If you found this project helpful, please give it a star!**

Made with ❤️ by [Nagarjun Avala](https://github.com/nagarjun-avala)
