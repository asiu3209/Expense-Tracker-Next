"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, getUserInfo, signOut } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const authStatus = isAuthenticated();
    setAuthenticated(authStatus);

    if (authStatus) {
      const userInfo = getUserInfo();
      setUser(userInfo);
    }
  }, [pathname]); // Re-check when route changes

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              href={authenticated ? "/dashboard" : "/"}
              className="text-xl font-bold text-blue-600"
            >
              Expense Tracker
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                {/* Authenticated Navigation */}
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname === "/dashboard"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </Link>
                {/* <Link
                  href="/Expenses"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname === "/Expenses"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Expenses
                </Link> */}

                {/* User Info & Sign Out */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                  {user && (
                    <span className="text-sm text-gray-600">{user.name}</span>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated Navigation */}
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname === "/"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/signin"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
