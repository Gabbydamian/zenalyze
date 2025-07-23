import { UpdatePasswordForm } from "@/components/update-password-form";
import Link from "next/link";
import { Flower } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-[var(--color-card)]/70 bg-dot-pattern p-6 md:p-10">
        <div className="w-full max-w-sm">
          <UpdatePasswordForm />
        </div>
      </div>
    </>
  );
}
