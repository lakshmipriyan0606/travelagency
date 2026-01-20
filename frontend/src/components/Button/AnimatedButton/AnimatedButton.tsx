import { Button } from "@/components/ui/button";

interface BorderAnimatedButtonProps {
  buttonText: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
  borderButtonColor?: string;
  onClick?: any;
  disabled?: boolean;
}

export default function AnimatedButton({
  buttonText,
  bgColor = 'bg-yellow-500',
  textColor = 'text-black',
  className = '',
  borderButtonColor = 'bg-black',
  onClick,
  disabled
}: BorderAnimatedButtonProps) {
  return (
    <Button
      className={`relative p-2 cursor-pointer font-semibold tracking-widest overflow-hidden group ${bgColor} ${textColor} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{buttonText}</span>

      {/* Horizontal lines */}
      <span
        className={`absolute top-[2px] right-[2px] w-[35%] h-[0.5px] ${borderButtonColor} transition-all duration-500 group-hover:w-[calc(100%-4px)]`}
      ></span>
      <span
        className={`absolute bottom-[2.3px] left-[2px] w-[35%] h-[0.5px] ${borderButtonColor} transition-all duration-500 group-hover:w-[calc(100%-4px)]`}
      ></span>

      {/* Vertical lines */}
      <span
        className={`absolute top-[2px] right-[2.5px] w-[0.5px] h-6 ${borderButtonColor} transition-all duration-500 delay-150 group-hover:h-[calc(100%-4px)]`}
      ></span>
      <span
        className={`absolute bottom-[2px] left-[2px] w-[0.5px] h-6 ${borderButtonColor} transition-all duration-500 delay-150 group-hover:h-[calc(100%-4px)]`}
      ></span>
    </Button>

  );
}
