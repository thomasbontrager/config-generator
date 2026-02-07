export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generator/:path*",
    "/admin/:path*",
  ]
}
