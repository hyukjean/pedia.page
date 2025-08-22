/* Cloudflare Pages Functions */

// 환경 변수 처리를 위한 설정
export const onRequest = async (context) => {
  // CORS 헤더 추가
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return context.next();
};
