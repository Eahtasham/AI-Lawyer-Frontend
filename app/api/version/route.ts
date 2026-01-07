import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    // Backend endpoint is at /version (not /api/version)
    const response = await fetch(`${backendUrl}/version`, {
        next: { revalidate: 3600 } // Cache for an hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend Error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Version API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
