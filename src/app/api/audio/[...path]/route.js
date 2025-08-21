import fs from "fs";
import path from "path";

function getAudioBaseUrl() {
  const configPath = path.join(process.cwd(), "public", "config.json");
  let baseUrl = "http://smartmedicalstatic.oss-cn-beijing.aliyuncs.com/_/assets/audio/";
  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf8");
      const cfg = JSON.parse(raw);
      if (typeof cfg.audioBaseUrl === "string" && cfg.audioBaseUrl) {
        baseUrl = cfg.audioBaseUrl.endsWith("/") ? cfg.audioBaseUrl : cfg.audioBaseUrl + "/";
      }
    }
  } catch {
    // ignore and use default baseUrl
  }
  return baseUrl;
}

function buildTargetUrl(segments) {
  const baseUrl = getAudioBaseUrl();
  const encodedPath = (Array.isArray(segments) ? segments : [segments])
    .map((s) => encodeURIComponent(s))
    .join("/");
  return baseUrl + encodedPath;
}

function buildCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
    "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length, Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: buildCorsHeaders() });
}

export async function HEAD(req, context) {
  const awaited = await context.params;
  const target = buildTargetUrl(awaited.path || []);
  const range = req.headers.get("range") || req.headers.get("Range");
  const upstream = await fetch(target, {
    method: "HEAD",
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  });

  const headers = new Headers();
  const passthrough = [
    "content-type",
    "content-length",
    "accept-ranges",
    "content-range",
    "last-modified",
    "etag",
    "cache-control",
  ];
  for (const key of passthrough) {
    const val = upstream.headers.get(key);
    if (val) headers.set(key, val);
  }

  const cors = buildCorsHeaders();
  Object.entries(cors).forEach(([k, v]) => headers.set(k, v));

  return new Response(null, { status: upstream.status, headers });
}

export async function GET(req, context) {
  const awaited = await context.params;
  const target = buildTargetUrl(awaited.path || []);
  const range = req.headers.get("range") || req.headers.get("Range");

  console.log("代理音频请求:", target, "Range:", range);

  const upstream = await fetch(target, {
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  });

  console.log("上游响应状态:", upstream.status, "Content-Type:", upstream.headers.get("content-type"));

  const headers = new Headers();
  
  // 传递所有上游响应头
  upstream.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  // 添加CORS头
  const cors = buildCorsHeaders();
  Object.entries(cors).forEach(([k, v]) => headers.set(k, v));

  console.log("最终响应头:", Object.fromEntries(headers.entries()));

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}


