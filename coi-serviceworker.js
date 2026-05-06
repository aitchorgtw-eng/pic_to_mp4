// coi-serviceworker.js
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("fetch", (event) => {
        // 僅處理導覽請求或同源資源，確保標頭注入
        if (event.request.mode === "navigate" || event.request.mode === "cors" || event.request.mode === "same-origin") {
            event.respondWith(
                fetch(event.request)
                    .then((response) => {
                        if (response.status === 0) return response;

                        const newHeaders = new Headers(response.headers);
                        newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
                        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                        return new Response(response.body, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: newHeaders,
                        });
                    })
                    .catch((e) => console.error("SW Fetch Error:", e))
            );
        }
    });
}