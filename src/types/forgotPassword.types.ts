export type ForgotPasswordStep = "email" | "confirmation" | "new-password" | "done";

export type StrengthInfo = {
  label: string;
  barClass: string;
  textClass: string;
};
