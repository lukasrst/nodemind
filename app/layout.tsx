"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, ReactNode } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Database, 
  Share2, 
  LayoutDashboard,
  Settings
} from "lucide-react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <html lang="de" className="dark">
      <body className="bg-neutral-950 text-neutral-200 antialiased">
        <div className="flex h-screen overflow-hidden">
          
          {/* --- Sidebar --- */}
          <aside 
            className={`relative flex flex-col flex-shrink-0 border-r border-white/5 bg-neutral-900/50 backdrop-blur-xl transition-all duration-300 ease-in-out z-20 ${
              isCollapsed ? "w-[80px]" : "w-[260px]"
            }`}
          >
            {/* Header / Logo */}
            <div className="h-20 flex items-center px-6 border-b border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 min-w-max">
                <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0 shadow-lg shadow-blue-900/20">
                  <LayoutDashboard className="text-white" size={20} />
                </div>
                {!isCollapsed && (
                  <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                    Thought UI
                  </span>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <NavItem href="/" icon={<Home size={22} />} isCollapsed={isCollapsed} active={pathname === "/"}>
                Dashboard
              </NavItem>
              <NavItem href="/relation" icon={<Database size={22} />} isCollapsed={isCollapsed} active={pathname === "/relation"}>
                Relation
              </NavItem>
              <NavItem href="/manage-db" icon={<Database size={22} />} isCollapsed={isCollapsed} active={pathname === "/manage-db"}>
                Database
              </NavItem>
              <NavItem href="/visual" icon={<Share2 size={22} />} isCollapsed={isCollapsed} active={pathname === "/visual"}>
                Insights
              </NavItem>
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/5">
               <NavItem href="/settings" icon={<Settings size={22} />} isCollapsed={isCollapsed} active={pathname === "/settings"}>
                  Settings
                </NavItem>
            </div>

            {/* Toggle Button - Stabiler positioniert */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400 shadow-xl transition-all hover:text-white hover:scale-110 z-30"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </aside>

          {/* --- Main Area --- */}
          <main className="flex-1 flex flex-col relative min-w-0 bg-neutral-950 overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-neutral-950/50 backdrop-blur-md flex-shrink-0">
               <div className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-500">Workspace</span>
                  <span className="text-neutral-700">/</span>
                  <span className="text-neutral-200 font-medium capitalize">
                    {pathname === "/" ? "Overview" : pathname.split("/").pop()}
                  </span>
               </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}

/* --- NavItem Sub-Component --- */
function NavItem({
  href,
  children,
  icon,
  isCollapsed,
  active
}: {
  href: string;
  children: ReactNode;
  icon: ReactNode;
  isCollapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center group rounded-xl transition-all duration-200
        ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3 h-12 w-full gap-4"}
        ${active 
          ? "bg-blue-600/10 text-blue-400" 
          : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"}
      `}
    >
      {/* Active Indicator Line */}
      {active && !isCollapsed && (
        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
      )}
      
      <div className={`flex-shrink-0 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>
        {icon}
      </div>

      {!isCollapsed && (
        <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {children}
        </span>
      )}

      {/* Tooltip bei einklappter Sidebar */}
      {isCollapsed && (
        <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all bg-white text-black text-[11px] font-bold py-1.5 px-3 rounded-md whitespace-nowrap z-50 shadow-2xl">
          {children}
        </div>
      )}
    </Link>
  );
}