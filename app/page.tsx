import { redirect } from "next/navigation";
import { CAMPAIGN_ROUTES } from "@/lib/campaignRoutes";

export default function HomePage() {
  redirect(CAMPAIGN_ROUTES.form);
}
