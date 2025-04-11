import { MiddlewareConfig, NextRequest, NextResponse } from 'next/server';

const publicRoutes = [
  {
    path: '/sign-in',
    whenAuthenticated: 'redirect',
  },
  {
    path: '/sign-up',
    whenAuthenticated: 'redirect',
  },
  {
    path: '/home',
    whenAuthenticated: 'next',
  },
] as const;

const NOT_AUTH_USER_ROUTE = '/sign-in';

export function middleware(request: NextRequest) {
  return;
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authToken = request.cookies.get('token');

  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = NOT_AUTH_USER_ROUTE;

    return NextResponse.redirect(redirectUrl);
  }

  if (
    authToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === 'redirect'
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';

    return NextResponse.redirect(redirectUrl);
  }

  if (authToken && !publicRoute) {
    // checar se o jwt está expirado
    // se sim, remove cookie e redireciona pro login

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Condições para disparar o middleware:
    
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
