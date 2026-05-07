/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("fetch", function (event) {
        if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
            return;
        }

        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.status === 0) {
                        return response;
                    }

                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                })
                .catch((e) => console.error(e))
        );
    });
} else {
    (() => {
        // 自動註冊邏輯
        const scriptEl = document.currentScript;
        if (!scriptEl) return;
        const currentScriptUrl = scriptEl.src;

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(currentScriptUrl).then((registration) => {
                registration.addEventListener('updatefound', () => {
                    // 若發現新的 Worker，自動重新整理頁面以套用隔離環境
                    console.log("正在套用跨來源隔離環境...");
                });
                // 如果 Worker 已經啟用，但頁面還沒被接管，強制重載
                if (registration.active && !navigator.serviceWorker.controller) {
                    window.location.reload();
                }
            }, (err) => {
                console.error('COOP/COEP Service Worker 註冊失敗:', err);
            });
        }
    })();
}