import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your expenses with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
          <div className=" mx-auto px-8 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold hover:opacity-80 transition"
            >
              Expense Tracker
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-xl hover:underline">
                Home
              </Link>
              <Link href="/Expenses" className="text-xl hover:underline">
                Expenses
              </Link>
              <Link href="/SignUp" className="text-xl hover:underline">
                Login
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
