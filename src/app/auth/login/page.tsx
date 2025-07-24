import { LoginForm } from "@/components/login-form";
export default function Page() {
  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-svh w-full flex flex-col items-center justify-center bg-[var(--color-card)]/70 bg-dot-pattern p-6 md:p-10">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
