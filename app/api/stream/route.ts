import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("query");
  const conversationId = searchParams.get("conversation_id");

  const contextWindow = searchParams.get("context_window");
  const webSearch = searchParams.get("web_search");
  
  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
  let apiUrl = `${backendUrl}/api/stream?query=${encodeURIComponent(query)}`;
  
  if (conversationId) {
    apiUrl += `&conversation_id=${encodeURIComponent(conversationId)}`;
  }
  if (contextWindow) {
    apiUrl += `&context_window=${encodeURIComponent(contextWindow)}`;
  }
  if (webSearch) {
    apiUrl += `&web_search=${encodeURIComponent(webSearch)}`;
  }

  const authHeader = req.headers.get("Authorization");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  try {
    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!backendResponse.ok) {
        console.error("Backend returned error:", backendResponse.status, backendResponse.statusText);
        return NextResponse.json(
            { error: `Backend error: ${backendResponse.statusText}` }, 
            { status: backendResponse.status }
        );
    }

    if (!backendResponse.body) {
        return NextResponse.json({ error: "No response body from backend" }, { status: 500 });
    }

    // Pass the stream through
    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Stream Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
