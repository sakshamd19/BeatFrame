export default function middleware(request) {
  // Note: Vercel Edge isolates do not share memory globally. 
  // This provides a per-isolate threshold limit which is basic protection 
  // without needing a paid Redis/KV setup.
  
  // Vercel Edge runtime doesn't directly support global memory cleanly between all invocations 
  // but it persists across warm isolates.
  globalThis.rateLimitMap = globalThis.rateLimitMap || new Map();
  const rateLimitMap = globalThis.rateLimitMap;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/_vite') || url.pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js)$/)) {
    return;
  }

  // Get IP
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 req per minute per isolate

  if (rateLimitMap.has(ip)) {
    const data = rateLimitMap.get(ip);
    
    if (now - data.startTime > windowMs) {
      rateLimitMap.set(ip, { count: 1, startTime: now });
    } else {
      data.count++;
      if (data.count > maxRequests) {
        return new Response(
          JSON.stringify({ error: 'Too Many Requests', message: 'You have exceeded the rate limit. Please try again later.' }), 
          { 
            status: 429, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      rateLimitMap.set(ip, data);
    }
  } else {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  }
}

export const config = {
  matcher: [
    '/((?!api/verify-turnstile|_next/static|_next/image|favicon.ico).*)',
  ],
};
