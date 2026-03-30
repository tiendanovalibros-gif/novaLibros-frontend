import { useState } from "react";

export function useStepConfirmation() {
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResend = () => {
    setResent(true);
    setCountdown(30);
    // TODO: await resendEmail(email) desde auth.service.ts
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return { resent, countdown, handleResend };
}
