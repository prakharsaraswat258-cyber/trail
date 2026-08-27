"use client";

import React, { useState } from "react";
import { FoundItemForm } from "@/components/found/FoundItemForm";
import { ConfirmationScreen } from "@/components/found/ConfirmationScreen";
import { FoundItemResponse, FoundItemPayload } from "@/lib/types/foundItem";

export default function FoundPage() {
  const [submittedData, setSubmittedData] = useState<{
    response: FoundItemResponse;
    payload: FoundItemPayload;
  } | null>(null);

  const handleSuccess = (response: FoundItemResponse, payload: FoundItemPayload) => {
    setSubmittedData({ response, payload });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setSubmittedData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
