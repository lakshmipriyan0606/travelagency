import { AirplaneLoader } from "@travelagency/ui";

export default function BlogsLoading() {
  return (
    <AirplaneLoader
      size="lg"
      label="Loading blogs…"
      fullPage
      className="py-16"
    />
  );
}
