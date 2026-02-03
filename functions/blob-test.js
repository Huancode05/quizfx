/**
 * 临时 Blobs 测试函数
 * 作用：
 * 1. 写入一个 blob
 * 2. 再读出来
 * 3. 返回结果 + 调试信息
 *
 * ✔ 后期可以整段删除
 */

import { getStore } from "@netlify/blobs";

export async function handler() {
  const logs = [];
  const log = (msg) => {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logs.push(line);
    console.log(line);
  };

  try {
    log("🔌 尝试获取 Blob store");
    const store = getStore("quizfx-test");

    const key = "hello";
    const value = {
      msg: "Hello from Netlify Blobs",
      time: Date.now()
    };

    log("✍️ 写入 Blob");
    await store.setJSON(key, value);

    log("📖 读取 Blob");
    const readBack = await store.getJSON(key);

    log("✅ Blobs 读写成功");

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        data: readBack,
        logs
      }, null, 2)
    };
  } catch (err) {
    log("❌ Blobs 出错");
    log(err.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message,
        logs
      }, null, 2)
    };
  }
}