import { Button } from "../ui/button";

type PrimaryOutlineButtonProps = {
  buttonName: string;
  animated?: boolean;
};

const PrimaryOutlineButton = ({ buttonName, animated = false }: PrimaryOutlineButtonProps) => {
  return (
    <Button
      className="
        relative overflow-hidden 
        bg-transparent border border-primary text-primary 
        hover:bg-primary hover:text-white 
        rounded px-4 py-2 text-sm font-normal cursor-pointer
        transition-all duration-300
      "
    >
      {/* 1. Text must be z-10 so the shine goes BEHIND it */}
      <span className="relative z-10">{buttonName}</span>

      {animated && (
        <span
          className="
            absolute inset-0 
            -translate-x-full
            z-0
            animate-shimmer-slide
            
            /* --- THE FIX --- */
            /* We use 'via-white/60'. This creates a BRIGHT Silver shine. */
            /* 60% opacity is strong enough to pop against the black header. */
            bg-gradient-to-r from-transparent via-white/60 to-transparent
          "
        ></span>
      )}
    </Button>
  );
};

export default PrimaryOutlineButton;