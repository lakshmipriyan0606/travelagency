import { AirplaneLoader } from "@travelagency/ui";

export default function AdminLoading() {
  return (
    <AirplaneLoader
      size="lg"
      label="Preparing flight deck…"
      fullPage
      className="py-16"
    />
  );
}
