import type { Metadata } from "next";
import "./globals.css";
import AdminSidebar from "./components/AdminSidebar";

export const metadata: Metadata = {
  title: "AfriBrok Admin",
  description: "Regulator dashboard for AfriBrok.com"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminSidebar>
          {children}
        </AdminSidebar>
      </body>
    </html>
  );
}
