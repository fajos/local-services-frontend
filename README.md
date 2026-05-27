# 🎨 Local Service Finder – Frontend

This is the **modern, mobile-first frontend** for the **Local Service Finder platform**. Built with Next.js 14, it provides a seamless experience for customers to find services, providers to manage their business, and admins to oversee the marketplace.

---

## 🚀 Features

✅ **Responsive Design** – Optimized for mobile, tablet, and desktop using Tailwind CSS.  
✅ **Unified Admin Dashboard** – High-trust verification system with manual ID review tools.  
✅ **Provider Marketplace** – Browse services, view verified badges, and book professionals.  
✅ **Identity Verification Flow** – Users can upload government IDs for manual admin approval.  
✅ **Real-time Notifications** – Toast notifications for actions like bookings, approvals, and errors.  
✅ **Dark Mode UI** – Professional dark-themed admin and provider interfaces.  
✅ **Secure Auth** – JWT-based session management with protected routes.  

---

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (Static Typing)
- **Tailwind CSS** (Styling)
- **Axios** (API Requests)
- **React Hot Toast** (Notifications)
- **Heroicons** (Iconography)

---

## 📁 Folder Structure

```
frontend/
├── app/              → Next.js App Router (Pages & Layouts)
│   ├── admin/        → Admin Dashboard (User Management, ID Verification)
│   ├── profile/      → User Settings & Identity Submission
│   ├── services/     → Marketplace & Service Discovery
│   └── (auth)/       → Login & Registration flows
├── components/       → Reusable UI components (Modals, Tables, Cards)
├── context/          → React Context for Auth & Global State
├── lib/              → API configuration (Axios instances)
├── utils/            → Helper functions & Formatters
└── public/           → Static assets (Logos, Icons)
```

---

## ⚙️ Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/local-service-frontend.git
cd local-service-frontend
npm install
```

### 2. Configure Environment (`.env.local`)

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛡 Identity Verification System

The frontend implements a multi-step verification UI:
1. **Submission**: Providers upload ID details (Type, Number) and Photo URLs/Files.
2. **Pending State**: User profile displays a "Verification Pending" status.
3. **Admin Review**: Admins use the dashboard to inspect IDs and Approve/Reject.
4. **Verified Badge**: Once approved, a blue checkmark is automatically displayed on the provider's profile.

---

## 📄 License

MIT — Created with ❤️ for local service entrepreneurs.

---

## 🙌 Built by Femi Adeyemi (a.k.a. Fajos)

Building the future of local commerce 🚀

---

🗓️ **Last Updated:** May 27, 2026
