"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FoundItemForm } from "@/components/found/FoundItemForm";
import { ConfirmationScreen } from "@/components/found/ConfirmationScreen";
import { FoundItemResponse, FoundItemPayload } from "@/lib/types/foundItem";

export default function FoundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submittedData, setSubmittedData] = useState<{
    response: FoundItemResponse;
    payload: FoundItemPayload;
  } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/found");
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSuccess = (response: FoundItemResponse, payload: FoundItemPayload) => {
    setSubmittedData({ response, payload });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setSubmittedData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="w-full max-w-[640px] mx-auto py-20 flex justify-center items-center text-xs text-text-secondary">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="w-full">
      {submittedData ? (
        <ConfirmationScreen
          response={submittedData.response}
          payload={submittedData.payload}
          onReset={handleReset}
        />
      ) : (
        <FoundItemForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}
