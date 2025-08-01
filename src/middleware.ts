import { updateSession } from "@/lib/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any common image file extensions
     * - sitemap.xml
     * - robots.txt
     */
    "/((?!_next/static|_next/image|sitemap.xml|robots.txt|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"    // // Explicitly exclude these public files
    // "/sitemap.xml",
    // "/robots.txt",
  ],
};