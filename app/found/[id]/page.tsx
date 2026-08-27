"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReportDetailView } from "@/components/found/ReportDetailView";
import { getFoundItem } from "@/lib/api/foundItems";
import { FoundItemRecord } from "@/lib/types/foundItem";
import { BentoCard } from "@/components/ui/BentoCard";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [report, setReport] = useState<FoundItemRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getFoundItem(id);
        if (isMounted) {
          if (data) {
            setReport(data);
          } else {
            setError("Report not found or has expired.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load report");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[640px] mx-auto py-20 flex flex-col items-center justify-center gap-3 text-center">
        <RefreshCw className="w-6 h-6 text-accent animate-spin" />
        <span className="text-sm font-medium text-text-secondary">Loading report details...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="w-full max-w-[640px] mx-auto py-12">
        <BentoCard className="text-center py-10 px-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-error flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Report Not Found</h1>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            {error || "We couldn&apos;t find a report matching this ID."}
          </p>
          <div className="pt-2">
            <Link href="/found">
              <Button variant="primary">Go to Found Page</Button>
            </Link>
          </div>
        </BentoCard>
      </div>
    );
  }

  return <ReportDetailView initialReport={report} />;
}
