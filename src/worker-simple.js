// Simple Cloudflare Worker for Pedia.page
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Supported languages
      const supported = ['en','ja','ko','de','it','no'];

      // Extract language preference
      const paramsLang = url.searchParams.get('lang');
      const cookieHeader = request.headers.get('Cookie') || '';
      const cookieLang = (/\blang=([^;]+)/.exec(cookieHeader)?.[1] || '').toLowerCase();
      const acceptLang = request.headers.get('Accept-Language') || '';

      const normalize = (code) => {
        if (!code) return '';
        const lower = code.toLowerCase();
        const base = lower.split('-')[0];
        return supported.includes(lower) ? lower : (supported.includes(base) ? base : '');
      };

      let chosenLang = '';
      let shouldSetCookie = false;

      // 1) URL param overrides
      const paramNorm = normalize(paramsLang || '');
      if (paramNorm) {
        chosenLang = paramNorm;
        shouldSetCookie = true;
      }

      // 2) Existing cookie
      if (!chosenLang) {
        const cookieNorm = normalize(cookieLang);
        if (cookieNorm) {
          chosenLang = cookieNorm;
        }
      }

      // 3) Accept-Language header
      if (!chosenLang && acceptLang) {
        const tokens = acceptLang.split(',').map(t => t.trim().split(';')[0]);
        for (const t of tokens) {
          const n = normalize(t);
          if (n) { chosenLang = n; break; }
        }
        if (!chosenLang) chosenLang = 'en';
        shouldSetCookie = true;
      }
      if (!chosenLang) {
        chosenLang = 'en';
      }

      // Canonical host: redirect apex to www
      if (url.hostname === 'pedia.page') {
        const target = new URL(request.url);
        target.hostname = 'www.pedia.page';
        return Response.redirect(target.toString(), 301);
      }

      // Handle API routes
      if (path.startsWith('/api/')) {
        if (path === '/api/health') {
          return new Response(
            JSON.stringify({ status: 'ok', timestamp: Date.now() }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        
        return new Response(
          JSON.stringify({ message: 'API endpoint ready' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Try serving static asset from dist using the built-in assets binding
  let res = await env.ASSETS.fetch(new Request(url, request));
      
      // SPA fallback: serve index.html on 404 for client-side routes
      if (res.status === 404 && request.method === 'GET' && !path.includes('.')) {
        const indexUrl = new URL('/index.html', url.origin);
        res = await env.ASSETS.fetch(new Request(indexUrl, request));
      }

      // Add CORS headers and language cookie to static responses
      res = new Response(res.body, res);
      Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
      res.headers.set('Vary', ['Accept-Encoding','Accept-Language'].join(', '));
      if (shouldSetCookie) {
        res.headers.append('Set-Cookie', `lang=${chosenLang}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
      }
      return res;

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain', ...corsHeaders }
      });
    }
  },
};
