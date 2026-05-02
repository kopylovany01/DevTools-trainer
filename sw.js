/* Service Worker: имитирует API без бэкенда */

const TOKENS = {
  "NE-1": { status: 200, headerToken: "NE-HDR-44P", json: { ok: true } },
  "NE-2": { status: 200, headerToken: "NE-HDR-44P", json: { ok: true } },
  "NE-3": { status: 200, headerToken: "NE-HDR-44P", json: { payload: { token: "NE-BODY-7HF" } } },
  "NE-4": { status: 418, headerToken: "NE-HDR-44P", json: { error: { token: "NE-418-QQ1", message: "teapot" } } },
  "NE-5": { status: 200, headerToken: "NE-HDR-44P", json: { ok: true, echo: { requestHeaders: true } } },
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname !== "/api/mission") return;

  event.respondWith(handleMission(event.request, url));
});

async function handleMission(request, url) {
  const task = url.searchParams.get("task") || "NE-1";
  const entry = TOKENS[task] || TOKENS["NE-1"];

  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-trainer-token": entry.headerToken,
  });

  if (task === "NE-5") {
    headers.set("x-seen-client-id", request.headers.get("x-client-id") || "");
  }

  const body = JSON.stringify({ task, ...entry.json }, null, 2);
  return new Response(body, { status: entry.status, headers });
}

