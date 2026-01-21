import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - OlieHub Unblocker
 * Garante que rotas de API nunca fiquem pendentes por lógica de sessão.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🚨 CRÍTICO: Bypass total para rotas de API
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};