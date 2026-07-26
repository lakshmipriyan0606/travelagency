"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNavigation, AdminNavItem } from "@/features/navigation";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Expand menus that contain the active path
    const initial: Record<string, boolean> = {};
    adminNavigation.forEach((item) => {
      if (item.children?.some(child => pathname.startsWith(child.href))) {
        initial[item.title] = true;
      }
    });
    return initial;
  });

  const toggleExpand = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderItem = (item: AdminNavItem, isNested = false) => {
    const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href) && item.href !== "/admin");
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.title];
    const Icon = item.icon;

    return (
      <div key={item.title} className="mb-1">
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(item.title)}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors ${
              isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={18} />
              <span>{item.title}</span>
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <Link
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${isNested ? 'ml-6' : ''} ${
              isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} />
            <span>{item.title}</span>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="h-full bg-white border-r border-gray-200 flex flex-col overflow-y-auto w-64 flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
      </div>
      <nav className="flex-1 p-4">
        {adminNavigation.map(item => renderItem(item))}
      </nav>
    </aside>
  );
}
