import { useState } from "react";
import type { ForgotPasswordStep } from "@/types/forgotPassword.types";

export function useForgotPassword() {
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");

  const goToConfirmation = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("confirmation");
  };

  const goToNewPassword = () => setStep("new-password");
  const goToDone = () => setStep("done");

  return { step, email, goToConfirmation, goToNewPassword, goToDone };
}
