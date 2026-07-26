import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BorderAnimatedButtonProps {
  buttonText: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
  borderButtonColor?: string;
  onClick?: any;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  asChild?: boolean;
  to?: string;
  children?: React.ReactNode;
}

export default function AnimatedButton({
  buttonText,
  bgColor = 'bg-yellow-500',
  textColor = 'text-black',
  className = '',
  borderButtonColor = 'bg-black',
  onClick,
  disabled,
  type = "button",
  asChild = false,
  to,
  children
}: BorderAnimatedButtonProps) {
  const content = (
    <>
      <span className="relative z-10">{buttonText}</span>

      {/* Horizontal lines */}
      <span
        className={`absolute top-[2px] right-[2px] w-[35%] h-[0.5px] ${borderButtonColor} transition-all duration-500 group-hover:w-[calc(100%-4px)] hidden md:block`}
      ></span>
      <span
        className={`absolute bottom-[2.3px] left-[2px] w-[35%] h-[0.5px] ${borderButtonColor} transition-all duration-500 group-hover:w-[calc(100%-4px)] hidden md:block`}
      ></span>

      {/* Vertical lines */}
      <span
        className={`absolute top-[2px] right-[2.5px] w-[0.5px] h-6 ${borderButtonColor} transition-all duration-500 delay-150 group-hover:h-[calc(100%-4px)] hidden md:block`}
      ></span>
      <span
        className={`absolute bottom-[2px] left-[2px] w-[0.5px] h-6 ${borderButtonColor} transition-all duration-500 delay-150 group-hover:h-[calc(100%-4px)] hidden md:block`}
      ></span>
    </>
  );

  return (
    <Button
      asChild={asChild || !!to}
      type={type}
      className={`relative p-2 cursor-pointer font-semibold tracking-widest overflow-hidden group shadow-none border-none ${bgColor} ${textColor} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {asChild ? (
        children
      ) : to ? (
        <Link href={to} className="w-full h-full flex items-center justify-center">
          {content}
        </Link>
      ) : (
        content
      )}
    </Button>
  );
}

