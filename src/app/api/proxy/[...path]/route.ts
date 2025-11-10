/**
 * Next.js API Route Proxy
 *
 * This proxies requests to the backend to avoid CORS issues in development.
 * The browser sees requests going to the same origin (your Next.js server).
 *
 * WARNING: This is a temporary solution for development.
 * The proper fix is to configure CORS on the backend.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://glamlink-api.africacodefoundry.com";

// Helper function to proxy requests
async function proxyRequest(
  request: NextRequest,
  path: string,
  method: string
) {
  const url = `${BACKEND_URL}/${path}`;

  // Get the request body if it exists
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await request.text();
    } catch (e) {
      body = undefined;
    }
  }

  // Forward headers from the original request
  const headers: HeadersInit = {};
  const contentType = request.headers.get("Content-Type");
  if (contentType && body) {
    headers["Content-Type"] = contentType;
  }

  // Forward Authorization header if present
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body && method !== "GET" && method !== "HEAD" ? body : undefined,
    });

    // Get response data
    const data = await response.text();

    // Try to parse as JSON, otherwise return as text
    let responseData;
    try {
      responseData = JSON.parse(data);
    } catch {
      responseData = data;
    }

    // Return response with appropriate status
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Proxy request failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = searchParams ? `${path}?${searchParams}` : path;

  return proxyRequest(request, fullPath, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
  return proxyRequest(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
  return proxyRequest(request, path, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
  return proxyRequest(request, path, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params;
  const path = pathArray.join("/");
  return proxyRequest(request, path, "DELETE");
}
