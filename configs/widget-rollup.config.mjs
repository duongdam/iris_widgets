import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssUrl from "postcss-url";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";

const configDir = dirname(fileURLToPath(import.meta.url));

const tailwindPostcssPlugins = [
    tailwindcss({ config: join(configDir, "tailwind.config.js") }),
    autoprefixer(),
];

const sassModernUse = [["sass", { api: "modern-compiler" }]];

export default async args => {
    const { postCssPlugin } = await import("@mendix/pluggable-widgets-tools/configs/rollup.config.mjs");
    const production = Boolean(args.configProduction);

    return args.configDefaultConfig.map(config => {
        const outputFormat = config.output?.format;

        const plugins = config.plugins.map(plugin => {
            if (!plugin || plugin.name !== "postcss") {
                return plugin;
            }

            const isInject = plugin.options?.inject === true;

            if (isInject) {
                return postcss({
                    extensions: [".css", ".sass", ".scss"],
                    extract: false,
                    inject: true,
                    minimize: production,
                    plugins: [postcssImport(), postcssUrl({ url: "inline" }), ...tailwindPostcssPlugins],
                    sourceMap: !production ? "inline" : false,
                    use: sassModernUse,
                });
            }

            const format = outputFormat === "es" ? "es" : "amd";
            return postCssPlugin(format, production, tailwindPostcssPlugins);
        });

        return { ...config, plugins };
    });
};
