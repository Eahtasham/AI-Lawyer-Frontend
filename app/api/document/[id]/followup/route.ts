import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;
  const question = searchParams.get("question");

  if (!question) {
    return NextResponse.json({ error: "Question parameter is required" }, { status: 400 });
  }

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiUrl = `${backendUrl}/api/document/${id}/followup?question=${encodeURIComponent(question)}`;

    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers: { Authorization: authHeader },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: `Backend error: ${backendResponse.statusText}` },
        { status: backendResponse.status }
      );
    }

    if (!backendResponse.body) {
      return NextResponse.json({ error: "No response body" }, { status: 500 });
    }

    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("FollowUp Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
