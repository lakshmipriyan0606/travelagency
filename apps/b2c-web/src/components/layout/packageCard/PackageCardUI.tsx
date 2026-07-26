import React from "react";
import Image from "next/image";
import { CurrencySymbol } from "@/lib/utils";

export function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`flex items-center justify-between gap-4 ${className}`}>{children}</div>;
}

export function Divider() {
    return <div className="w-full h-[2px] bg-gray-300" />;
}

export function IconText({ icon, text }: { icon: any; text: string | any }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            {typeof icon === 'string' || icon?.src ? (
                <Image src={icon} alt="" className="w-5 h-5" />
            ) : (
                icon
            )}
            <h3 className="line-clamp-1">{text}</h3>
        </div>
    );
}

export function PriceStrike({ original, final }: { original: number | string; final: number | string }) {
    return (
        <span className="flex items-center text-lg">
            <span className="relative inline-block text-base mr-2">
                {CurrencySymbol} {original}
                <span className="absolute top-1/2 right-0 w-full h-[3px] bg-red-500 rotate-[10deg]" />
            </span>
            <span className="text-xl font-bold text-gray-900">{CurrencySymbol} {final}</span>
        </span>
    );
}

