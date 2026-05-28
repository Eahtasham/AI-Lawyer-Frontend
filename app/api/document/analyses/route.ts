import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(`${backendUrl}/api/document/analyses`, {
      headers: { Authorization: authHeader },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: `Backend error: ${backendResponse.statusText}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analyses List Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
