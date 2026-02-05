import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    if (!backendUrl) {
        console.error("Setup Error: NEXT_PUBLIC_BACKEND_URL is missing");
        return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
    }

    const targetUrl = `${backendUrl}/api/download-judgement?url=${encodeURIComponent(url)}`;
    console.log(`[Proxy] Forwarding request to: ${targetUrl}`);

    try {
        // Forward the request to the backend
        const backendResponse = await fetch(targetUrl, {
            method: 'GET',
            // Forward headers if necessary, e.g., auth tokens
        });

        if (!backendResponse.ok) {
            console.error(`[Proxy] Backend error: ${backendResponse.status} ${backendResponse.statusText}`);
            const text = await backendResponse.text();
            console.error(`[Proxy] Backend error body: ${text}`);
            return NextResponse.json({ error: "Failed to fetch from backend", details: text }, { status: backendResponse.status });
        }

        // Get the headers from the backend response
        const headers = new Headers();
        headers.set("Content-Type", backendResponse.headers.get("Content-Type") || "application/pdf");
        const contentDisposition = backendResponse.headers.get("Content-Disposition");
        if (contentDisposition) {
            headers.set("Content-Disposition", contentDisposition);
        }

        // Return the response as a stream
        return new NextResponse(backendResponse.body, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
