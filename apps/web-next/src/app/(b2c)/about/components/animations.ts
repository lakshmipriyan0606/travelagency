export const fadeInUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInUpTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
} as any;

export const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
} as any;
