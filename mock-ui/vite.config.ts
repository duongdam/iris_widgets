import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@iris/chart-core": path.resolve(__dirname, "../packages/chart-core/src/index.ts"),
            "@iris/chart-ui": path.resolve(__dirname, "../packages/chart-ui/src/index.ts"),
            "@iris/chart-echarts": path.resolve(__dirname, "../packages/chart-echarts/src/index.ts"),
        },
    },
    server: {
        port: 5173,
        open: true,
    },
    optimizeDeps: {
        include: [
            "echarts-for-react",
            "echarts",
            "mobx",
            "mobx-react-lite",
            "antd",
            "dhtmlx-gantt",
            "classnames",
        ],
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
});
