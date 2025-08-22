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

      // Simple HTML response for now
      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedia.page - AI-powered Flashcard Generator</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            margin: 0; 
            padding: 40px 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .container { 
            max-width: 600px; 
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        h1 { 
            font-size: 2.5rem; 
            margin-bottom: 20px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        p { 
            font-size: 1.2rem; 
            line-height: 1.6;
            opacity: 0.9;
        }
        .status {
            background: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Pedia.page</h1>
        <p>AI-powered Flashcard Generator</p>
        <div class="status">
            <p>✅ Cloudflare Workers 배포 완료!</p>
            <p>📅 ${new Date().toLocaleString('ko-KR')}</p>
            <p>🌍 도메인: ${url.hostname}</p>
        </div>
        <p>곧 완전한 기능이 제공될 예정입니다.</p>
    </div>
</body>
</html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain', ...corsHeaders }
      });
    }
  },
};
