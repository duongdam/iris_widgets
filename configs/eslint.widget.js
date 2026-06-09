/** @type {import("eslint").Linter.Config} */
module.exports = {
    ...require("@mendix/pluggable-widgets-tools/configs/eslint.ts.base.json"),
    parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2018,
        sourceType: "module",
    },
    ignorePatterns: ["dist/**", "deployment/**", "node_modules/**"],
};
