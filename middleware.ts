
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * OlieHub Security Middleware
 * Protege rotas de API sensíveis e gerencia a sessão do Supabase.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // 1. Proteger rotas de API sensíveis (exceto webhooks externos)
  const isSensitiveApi = 
    pathname.startsWith('/api/tiny') || 
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/customers') ||
    pathname.startsWith('/api/products') ||
    (pathname.startsWith('/api/vnda') && !pathname.includes('/integration'));

  if (isSensitiveApi && !session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sessão necessária para acessar recursos do ateliê.' },
      { status: 401 }
    )
  }

  // 2. Proteger páginas administrativas
  if (pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/#settings', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
