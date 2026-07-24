"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Copy, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeletePackage, useTogglePackageStatus } from "../api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PackageListTable({ packages, totalPages, currentPage }: { packages: any[], totalPages: number, currentPage: number }) {
  const router = useRouter();
  const deleteMutation = useDeletePackage();
  const statusMutation = useTogglePackageStatus();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      await deleteMutation.mutateAsync(id);
      router.refresh();
    }
  };

  const handleToggleStatus = async (id: string) => {
    await statusMutation.mutateAsync(id);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No packages found.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg: any) => (
                <TableRow key={pkg._id}>
                  <TableCell className="font-medium">{pkg.packageName}</TableCell>
                  <TableCell>{pkg.location || pkg.country}</TableCell>
                  <TableCell>${pkg.price}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${pkg.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {pkg.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(pkg._id)} title="Toggle Status">
                        {pkg.status === 'Active' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link href={`/admin/packages/${pkg._id}`}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg._id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="py-4 border-t border-gray-200 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={currentPage > 1 ? `/admin/packages?page=${currentPage - 1}` : "#"} 
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <PaginationItem>
                <PaginationNext 
                  href={currentPage < totalPages ? `/admin/packages?page=${currentPage + 1}` : "#"} 
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
