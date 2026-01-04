import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Forward all body params including conversation_id
    const { query, top_k, conversation_id } = body;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    const authHeader = req.headers.get("Authorization");
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (authHeader) {
        headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, top_k, conversation_id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend Error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
