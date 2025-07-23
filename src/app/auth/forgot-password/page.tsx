import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Navbar } from "@/components/landing/navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="min-h-svh w-full flex flex-col items-center justify-center bg-[var(--color-card)]/70 bg-dot-pattern p-6 md:p-10">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </>
  );
}
