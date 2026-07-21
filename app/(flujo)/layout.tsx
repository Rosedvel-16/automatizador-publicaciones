"use client";

import { CampaignFlowProvider } from "@/hooks/useCampaignFlow";
import { CampaignFlowShell } from "@/components/CampaignFlowShell";

export default function FlujoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CampaignFlowProvider>
      <CampaignFlowShell>{children}</CampaignFlowShell>
    </CampaignFlowProvider>
  );
}
