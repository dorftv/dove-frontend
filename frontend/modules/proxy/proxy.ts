import { defineNuxtModule, logger } from "@nuxt/kit";
import { IncomingMessage } from "http";
import { createProxyServer } from "http-proxy";
import internal from "stream";

export default defineNuxtModule({
    defaults: {
        target: "",
        path: "/v1/graphql",
    },
    meta: {
        configKey: "websocketProxy",
        name: "Websocket proxy",
    },
    setup(resolvedOptions, nuxt) {
        if (!nuxt.options.dev || !resolvedOptions.target) {
            return;
        }

        nuxt.hook("listen", (server) => {
            const proxy = createProxyServer({
                ws: true,
                secure: false,
                changeOrigin: true,
                target: resolvedOptions.target,
            });

            const proxyFn = (req: IncomingMessage, socket: internal.Duplex, head: Buffer) => {
                if (req.url && req.url.startsWith(resolvedOptions.path)) {
                    proxy.ws(req, socket, head);
                }
            };

            server.on("upgrade", proxyFn);

            nuxt.hook("close", () => {
                server.off("upgrade", proxyFn);
                proxy.close();
            });

            logger.info(`Websocket dev proxy started on ${resolvedOptions.path}`);
        });
    },
});
