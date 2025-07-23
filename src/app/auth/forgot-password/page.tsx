import { ForgotPasswordForm } from "@/components/forgot-password-form";
import Link from "next/link";
import { Flower } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="min-h-svh w-full flex flex-col items-center justify-center bg-[var(--color-card)]/70 bg-dot-pattern p-6 md:p-10">
        {/* <Link
          href="/"
          className="flex items-center gap-2 mb-8 text-[var(--color-primary)] font-head text-2xl font-bold hover:text-[#f66774] transition-colors"
        >
          <Flower className="w-7 h-7" />
          Zenalyze
        </Link> */}
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </>
  );
}
