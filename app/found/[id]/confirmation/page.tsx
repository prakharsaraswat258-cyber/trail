"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ConfirmationScreen } from "@/components/found/ConfirmationScreen";
import { getFoundItem } from "@/lib/api/foundItems";
import { FoundItemRecord } from "@/lib/types/foundItem";
import { RefreshCw } from "lucide-react";

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [report, setReport] = useState<FoundItemRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchReport() {
      const data = await getFoundItem(id);
      setReport(data);
      setIsLoading(false);
    }
    fetchReport();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[640px] mx-auto py-20 flex flex-col items-center justify-center gap-3 text-center">
        <RefreshCw className="w-6 h-6 text-accent animate-spin" />
        <span className="text-sm font-medium text-text-secondary">Loading confirmation...</span>
      </div>
    );
  }

  if (!report) {
    router.push("/found");
    return null;
  }

  return (
    <ConfirmationScreen
      response={{
        id: report.id,
        referenceCode: report.referenceCode,
        createdAt: report.createdAt,
        immediateMatchFound: false,
        report,
      }}
      payload={report}
      onReset={() => router.push("/found")}
    />
  );
}
