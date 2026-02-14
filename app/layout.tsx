"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Database, 
  Share2, 
  LayoutDashboard 
} from "lucide-react"; // npm install lucide-react

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <html lang="de">
      <body className="bg-neutral-950 text-white">
        <div className="flex min-h-screen">
          
          {/* Sidebar */}
          <aside 
            className={`relative transition-all duration-300 ease-in-out border-r border-neutral-800 bg-neutral-900 flex flex-col ${
              isCollapsed ? "w-20" : "w-64"
            }`}
          >
            {/* Header */}
            <div className={`h-20 flex items-center px-6 border-b border-neutral-800/50 ${isCollapsed ? "justify-center" : "justify-between"}`}>
              {!isCollapsed && (
                <span className="text-xl font-bold tracking-tight overflow-hidden whitespace-nowrap">
                  Thought UI
                </span>
              )}
              {isCollapsed && <LayoutDashboard className="text-blue-500" size={24} />}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <NavItem href="/" icon={<Home size={20} />} isCollapsed={isCollapsed}>
                Home
              </NavItem>
              <NavItem href="/manage-db" icon={<Database size={20} />} isCollapsed={isCollapsed}>
                Manage-DB
              </NavItem>
              <NavItem href="/visual" icon={<Share2 size={20} />} isCollapsed={isCollapsed}>
                Visual
              </NavItem>
            </nav>

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-24 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white p-1 rounded-full shadow-lg z-50 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </aside>

          {/* Content Area */}
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}

/* Hilfs-Komponente für Nav-Items */
function NavItem({
  href,
  children,
  icon,
  isCollapsed
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  isCollapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={isCollapsed ? String(children) : ""}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-neutral-800 group ${
        isCollapsed ? "justify-center" : ""
      }`}
    >
      <div className="text-neutral-400 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      {!isCollapsed && (
        <span className="text-sm font-medium text-neutral-300 group-hover:text-white whitespace-nowrap">
          {children}
        </span>
      )}
    </Link>
  );
}