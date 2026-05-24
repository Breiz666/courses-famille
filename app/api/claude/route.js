export async function POST(req) {
  const body = await req.json();
  const useWebSearch = !!body.web_search;
  const maxUses = Math.min(body.max_web_searches || 25, 80);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: useWebSearch ? 8000 : 2000,
      messages: body.messages,
      ...(useWebSearch ? {
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
          max_uses: maxUses,
          user_location: {
            type: "approximate",
            country: "FR",
            timezone: "Europe/Paris"
          }
        }]
      } : {})
    })
  });
  const data = await response.json();
  return Response.json(data);
}
