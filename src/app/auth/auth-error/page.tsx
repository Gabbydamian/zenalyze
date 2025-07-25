// app/auth/auth-error/page.tsx
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Authentication Error
        </h1>
        <p className="text-gray-700 mb-6">
          Something went wrong during the authentication process. Please try
          again.
        </p>
        <Link href="/login" className="text-blue-600 hover:underline">
          Go back to Login
        </Link>
      </div>
    </div>
  );
}
