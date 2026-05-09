/* Service Worker: имитирует API без бэкенда */

const TOKENS = {
  "NE-1": { status: 200, headerToken: "NE-HDR-44P", json: { ok: true } },
  "NE-2": { status: 200, headerToken: "NE-HDR-44P", json: { ok: true } },
  "NE-3": { status: 200, headerToken: "NE-HDR-44P", json: { payload: { token: "NE-BODY-7HF" } } },
  "NE-4": { status: 418, headerToken: "NE-HDR-44P", json: { error: { token: "NE-418-QQ1", message: "teapot" } } },
  "NE-5": { status: 200, headerToken: "NE-HDR-44P", json: { ok: true, echo: { requestHeaders: true } } },
  "L2-NE-1": { status: 200, headerToken: "L2-NE-H1", json: { ok: true, incident: "duplicate-order" } },
  "L2-NE-2": { status: 200, headerToken: "L2-NE-H2", json: { ok: true, trace: "retry-dup-11" } },
  "L2-NE-3": { status: 200, headerToken: "L2-NE-H3", json: { incident: { token: "L2-NE-B3", reason: "missing-idempotency-key" } } },
  "L2-NE-4": { status: 409, headerToken: "L2-NE-H4", json: { error: { token: "L2-NE-E4", message: "race detected" } } },
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/api/mission") {
    event.respondWith(handleMission(event.request, url));
    return;
  }
  if (url.pathname === "/api/order") {
    event.respondWith(handleOrder(event.request, url));
  }

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

async function handleOrder(request, url) {
  const caseId = url.searchParams.get("case") || "unknown";
  const reqNo = Number(url.searchParams.get("req") || "1");
  const source = url.searchParams.get("source") || "primary";

  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-order-token": caseId === "L2-NE-3" ? "L2-NE-H3" : caseId === "L2-DV-4" ? "L2-DV-4-TK" : `${caseId}-OK`,
    "x-order-source": source,
  });

  const status = caseId === "L2-NE-4" && reqNo > 1 ? 409 : 200;
  const body = JSON.stringify(
    {
      ok: status < 400,
      caseId,
      reqNo,
      source,
      message: status === 409 ? "duplicate order rejected" : "order accepted",
    },
    null,
    2
  );
  return new Response(body, { status, headers });
}

