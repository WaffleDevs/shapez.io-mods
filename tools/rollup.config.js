import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import sass from "rollup-plugin-sass";
import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { shapezMetadata } from "./metadata.js";
import { modSources, resolveModEntry } from "./mod_resolver.js";
import { shapez } from "./shapez_plugin.js";
import { resolveShapezModule, shapezExternal } from "./util.js";
import { marked } from "./marked.js";

const plugins = [
    // @ts-ignore invalid typings
    typescript(),
    // @ts-ignore invalid typings
    url({ limit: 0 }),
    // @ts-ignore invalid typings
    json({ exclude: "**/mod.json" }),
    sass(),
    marked(),
    shapezMetadata(),
    shapez(),
    // @ts-ignore invalid typings
    terser(),
    // @ts-ignore invalid typings
    commonjs(),
    nodeResolve()
];

/** @type {import("rollup").RollupOptions} */
const base = {
    output: {
        format: "iife",
        name: "m",
        exports: "named",
        esModule: false,
        globals: resolveShapezModule,
        sourcemap: process.env.NODE_ENV == "development" ? "inline" : false,
        generatedCode: {
            preset: "es2015",
            symbols: false,
        },
    },
    external: shapezExternal,
    plugins,
};

const configs = [];

for (const mod of modSources) {
    configs.push({
        ...base,
        input: resolveModEntry(mod),
        output: {
            ...base.output,
            file: `build/${mod}.mod.js`,
        },
    });
}

export default configs;
