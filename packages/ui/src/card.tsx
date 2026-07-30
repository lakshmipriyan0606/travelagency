import * as React from "react";
import { cn } from "@travelagency/utils";

export interface CardProps extends React.ComponentProps<"div"> {
  hoverable?: boolean;
}

function Card({ className, hoverable = true, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-[#181818] text-white flex flex-col gap-6 rounded-[20px] border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]",
        hoverable && "transition-all duration-150 hover:-translate-y-0.5 hover:border-[#F8B400]/30 hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)]",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 pb-2", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-[18px] font-semibold text-white leading-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-[14px] text-zinc-400", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("ml-auto flex items-center gap-2", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center pt-4 border-t border-white/[0.08]", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
