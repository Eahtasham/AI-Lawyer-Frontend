import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const apiUrl = `${backendUrl}/api/stream?query=${encodeURIComponent(query)}`;

  try {
    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
