"use client";

import * as React from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@travelagency/utils";
import { Button } from "./button";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface EnterpriseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function EnterpriseTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  filters,
  actions,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  emptyTitle = "No records found",
  emptyDescription = "There are no data records to display at this moment.",
}: EnterpriseTableProps<T>) {
  return (
    <div className="flex flex-col bg-[#181818] rounded-[20px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      {/* Table Toolbar */}
      {(onSearchChange || filters || actions) && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 border-b border-white/[0.08] bg-[#121212]">
          <div className="flex items-center gap-3 flex-1">
            {onSearchChange && (
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-10 w-full pl-10 pr-4 rounded-xl border border-white/[0.08] bg-[#181818] text-[14px] text-white placeholder:text-zinc-500 focus:border-[#F8B400] focus:ring-2 focus:ring-[#F8B400]/30 outline-none transition-all"
                />
              </div>
            )}
            {filters}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#121212] text-[13px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 z-10">
              {columns.map((col) => (
                <th key={col.key} className={cn("py-3.5 px-6", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-[15px] text-white">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="py-4 px-6">
                      <div className="h-5 bg-zinc-800 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="flex items-center justify-center h-14 w-14 rounded-full bg-[#F8B400]/15 text-[#F8B400] border border-[#F8B400]/30 mb-3">
                      <Inbox className="h-7 w-7" />
                    </div>
                    <h3 className="text-[18px] font-semibold text-white">
                      {emptyTitle}
                    </h3>
                    <p className="text-[14px] text-zinc-400 mt-1">
                      {emptyDescription}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-white/[0.03] transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("py-4 px-6", col.className)}>
                      {col.render
                        ? col.render(row)
                        : (row as Record<string, any>)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#121212]">
          <span className="text-[14px] text-zinc-400">
            Page <strong className="text-white">{currentPage}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
