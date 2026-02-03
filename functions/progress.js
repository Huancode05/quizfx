import { getStore } from "@netlify/blobs";

export default async (req) => {
  // 使用默认站点级 store
  const store = getStore("progress");

  // -------- 保存进度 --------
  if (req.method === "POST") {
    try {
      const { key, data } = JSON.parse(req.body || "{}");
      if (!key || !data) {
        return new Response("Missing key or data", { status: 400 });
      }

      await store.set(key, JSON.stringify(data));

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: e.message }),
        { status: 500 }
      );
    }
  }

  // -------- 列出当前用户的所有进度 --------
  if (
    req.method === "GET" &&
    req.queryStringParameters?.list
  ) {
    const { userKey } = req.queryStringParameters;
    if (!userKey) {
      return new Response("Missing userKey", { status: 400 });
    }

    const result = [];

    // 关键点：prefix 必须和你前端完全一致
    const prefix = `progress:${userKey}:`;

    for await (const entry of store.list({ prefix })) {
      const raw = await store.get(entry.key);
      if (!raw) continue;

      const data = JSON.parse(raw);
      result.push({
        fileHash: entry.key.split(":").pop(),
        ...data,
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // -------- 读取单个题库进度 --------
  if (req.method === "GET") {
    const key = req.queryStringParameters?.key;
    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    const data = await store.get(key);
    return new Response(data || "null", {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method Not Allowed", { status: 405 });
};