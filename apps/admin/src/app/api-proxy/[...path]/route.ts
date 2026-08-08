import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

async function proxyRequest(
  request: NextRequest,
  { path }: { path: string[] }
) {
  const backendPath = '/' + path.join('/');
  const search = request.nextUrl.search || '';
  const targetUrl = `${BACKEND_URL}${backendPath}${search}`;

  // Forward all request headers, including cookies from the browser
  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    // Skip headers that should not be forwarded
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  let body: BodyInit | null = null;
  const method = request.method;
  if (!['GET', 'HEAD'].includes(method)) {
    body = await request.arrayBuffer();
  }

  const backendRes = await fetch(targetUrl, {
    method,
    headers: forwardHeaders,
    body,
    // @ts-ignore
    duplex: 'half',
  });

  // Build response, copying ALL headers including Set-Cookie from backend
  const responseHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    // Next.js doesn't allow setting these, and we must strip content-encoding/content-length
    // because fetch automatically decompresses the body.
    if (!['transfer-encoding', 'connection', 'content-encoding', 'content-length'].includes(k)) {
      responseHeaders.append(key, value);
    }
  });

  const responseBody = await backendRes.arrayBuffer();

  return new NextResponse(responseBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: responseHeaders,
  });
}
