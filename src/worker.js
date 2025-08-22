/**
 * Pedia.page Cloudflare Worker
 * Handles static asset serving and API routing
 */

import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

// Asset manifest for KV storage
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    try {
      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        return await handleAPI(request, env);
      }

      // Handle static assets
      return await handleAssets(request, env, ctx);
      
    } catch (e) {
      console.error('Worker error:', e);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

/**
 * Handle API requests
 */
async function handleAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // API routes
  switch (path) {
    case '/api/health':
      return Response.json({ status: 'ok', timestamp: Date.now() }, { headers: corsHeaders });
      
    case '/api/generate':
      return await handleGenerate(request, env, corsHeaders);
      
    default:
      return new Response('API endpoint not found', { 
        status: 404, 
        headers: corsHeaders 
      });
  }
}

/**
 * Handle Gemini API generation (future enhancement)
 */
async function handleGenerate(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { topic, language = 'en', detail = 'basic' } = body;

    // For now, proxy to client-side (keeping existing functionality)
    // In the future, this can handle server-side Gemini API calls
    return Response.json({ 
      message: 'Generation should be handled client-side for now',
      topic,
      language,
      detail
    }, { headers: corsHeaders });
    
  } catch (error) {
    return Response.json({ 
      error: 'Invalid request body' 
    }, { 
      status: 400, 
      headers: corsHeaders 
    });
  }
}

/**
 * Handle static asset serving
 */
async function handleAssets(request, env, ctx) {
  const url = new URL(request.url);
  
  try {
    // Customize asset serving
    const options = {
      ASSET_NAMESPACE: env.__STATIC_CONTENT,
      ASSET_MANIFEST: assetManifest,
      mapRequestToAsset: req => {
        // Handle SPA routing - serve index.html for non-asset requests
        if (!req.url.includes('.') && !req.url.includes('/api/')) {
          return mapRequestToAsset(new Request(`${req.url.split('?')[0]}/index.html`, req));
        }
        return mapRequestToAsset(req);
      },
      cacheControl: {
        browserTTL: 60 * 60 * 24 * 30, // 30 days
        edgeTTL: 60 * 60 * 24 * 30,   // 30 days
      },
    };

    // Get asset from KV
    const page = await getAssetFromKV(
      {
        request,
        waitUntil: ctx.waitUntil,
      },
      options
    );

    // Add security headers
    const response = new Response(page.body, page);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;

  } catch (e) {
    console.error('Asset serving error:', e);
    
    // Fallback to index.html for SPA routing
    try {
      return await getAssetFromKV(
        {
          request: new Request(`${url.origin}/index.html`, request),
          waitUntil: ctx.waitUntil,
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (fallbackError) {
      return new Response('Page not found', { status: 404 });
    }
  }
}
