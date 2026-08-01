import { notFound } from "next/navigation";
import { DevopsLoginForm } from "@/features/devops/components/DevopsLoginForm";
import {
  getTodayIstParts,
  isSameIstCalendarDay,
  parseDevopsDateSegment,
} from "@/features/devops/dateOtp";

type Props = {
  params: Promise<{ date: string }>;
};

/**
 * Sole public DevOps entry. Wrong / malformed date → enterprise 404 (no date hints).
 */
export default async function DevopsDatedLoginPage({ params }: Props) {
  const { date } = await params;
  const parsed = parseDevopsDateSegment(date);
  const today = getTodayIstParts();

  if (!parsed || !isSameIstCalendarDay(parsed, today)) {
    notFound();
  }

  return <DevopsLoginForm />;
}
