// @ts-nocheck
/* eslint-disable */
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * Reusable Breadcrumb Component
 * Usage: <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Packages", href: "/allpackage" }, { label: "Honeymoon" }]} />
 */
const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center flex-wrap gap-1 text-xs sm:text-sm ${className}`}
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <span key={index} className="flex items-center gap-1">
                        {!isLast && item.href ? (
                            <Link
                                href={item.href}
                                className="text-gray-400 hover:text-primary transition-colors duration-200"
                            >
                                {item.label}
                            </Link>
                        ) : isLast ? (
                            <span className="text-primary font-medium">
                                {item.label}
                            </span>
                        ) : (
                            <span className="text-gray-400">{item.label}</span>
                        )}

                        {!isLast && (
                            <ChevronRight
                                size={12}
                                className="text-gray-500 flex-shrink-0"
                            />
                        )}
                    </span>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;

