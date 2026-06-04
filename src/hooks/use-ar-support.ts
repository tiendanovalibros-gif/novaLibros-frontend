"use client";

import { useEffect, useState } from "react";
import { checkArSupport, type ArSupportResult } from "@/lib/ar-support";

export function useArSupport() {
  const [result, setResult] = useState<ArSupportResult | null>(null);

  useEffect(() => {
    setResult(checkArSupport());
  }, []);

  return {
    loading: result === null,
    supported: result?.supported ?? false,
    reason: result?.reason ?? "",
  };
}
