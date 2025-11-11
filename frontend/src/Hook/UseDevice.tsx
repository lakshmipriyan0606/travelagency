import { useEffect, useState } from "react";

type DeviceSize = "small" | "medium" | "large" | "extra-large";

export function useDeviceSize(): DeviceSize {
  const [device, setDevice] = useState<DeviceSize>("small");

  const handleResize = () => {
    const width = window.innerWidth;

    if (width < 640) {
      setDevice("small"); // mobile
    } else if (width >= 640 && width < 768) {
      setDevice("medium"); // large mobile / small tablet
    } else if (width >= 768 && width < 1024) {
      setDevice("large"); // tablet / laptop
    } else {
      setDevice("extra-large"); // desktop
    }
  };

  useEffect(() => {
    handleResize(); // initial load
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return device;
}
