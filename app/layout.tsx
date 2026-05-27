import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast"; // ✅ Toast provider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#ffffff",
                color: "#333",
                border: "1px solid #e0e0e0",
                padding: "10px 16px",
                fontSize: "0.875rem",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}