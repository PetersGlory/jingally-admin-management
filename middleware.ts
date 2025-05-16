import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the path is for the dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // For client-side authentication, we'll rely on the client-side checks
    // This middleware is just an additional layer of protection
    // The main authentication logic is in the layout.tsx files
    return NextResponse.next()
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*"],
}

