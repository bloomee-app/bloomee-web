import { NextResponse, type NextRequest } from 'next/server'

// Read once at module scope: NEXT_PUBLIC_* values are inlined at build time, so there is
// nothing to re-read per request.
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN

/**
 * Hosts that must never be bounced to production: loopback, any bare hostname (localhost and
 * friends have no dot), and mDNS names used for testing from another device on the LAN.
 */
function isExemptHost(hostname: string): boolean {
  return (
    !hostname.includes('.') ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local')
  )
}

export function middleware(request: NextRequest) {
  // No canonical domain configured: do nothing. A missing variable must not take the site down.
  if (!BASE_DOMAIN) return NextResponse.next()

  // The Host header is the name the visitor actually used, which is what we are checking;
  // request.nextUrl can be rewritten by the platform in front of us.
  const host = request.headers.get('host')
  if (!host) return NextResponse.next()

  const hostname = host.replace(/:\d+$/, '').toLowerCase()
  if (isExemptHost(hostname) || hostname === BASE_DOMAIN.toLowerCase()) {
    return NextResponse.next()
  }

  // Path and query are carried across to the new origin. Note that Next normalizes the query
  // before middleware ever sees it - %20 arrives as +, a bare `flag` as `flag=`, `;` as %3B -
  // and request.url is normalized identically, so there is no raw form left to preserve. Every
  // one of those pairs decodes to the same value, so the query survives in meaning if not byte
  // for byte.
  //
  // The fragment needs no handling: it is never sent to the server, and the browser re-applies
  // the original one to the redirect target because this Location carries none (RFC 7231 7.1.2).
  const target = new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    `https://${BASE_DOMAIN}`
  )
  return NextResponse.redirect(target, 308)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
