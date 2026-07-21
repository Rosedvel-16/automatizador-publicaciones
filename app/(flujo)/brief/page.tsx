"use client";

import { BriefForm } from "@/components/BriefForm";
import { useCampaignFlow } from "@/hooks/useCampaignFlow";

export default function BriefPage() {
  const { brief, handleBriefSubmit } = useCampaignFlow();

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-white mb-2">
          Brief del producto
        </h2>
        <p className="text-sm text-neutral-500 max-w-lg">
          Completa los datos mínimos. La IA investigará tu mercado y generará un
          borrador de estrategia publicitaria.
        </p>
      </div>
      <BriefForm
        onSubmit={handleBriefSubmit}
        initialValues={brief ?? undefined}
      />
    </section>
  );
}
