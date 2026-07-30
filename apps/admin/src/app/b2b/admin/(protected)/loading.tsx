import { AirplaneLoader } from "@travelagency/ui";

export default function B2BAdminLoading() {
  return (
    <AirplaneLoader
      size="lg"
      label="Preparing flight deck…"
      fullPage
      className="py-16"
    />
  );
}
