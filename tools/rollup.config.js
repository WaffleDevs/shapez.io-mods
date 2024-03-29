import commonjs from "@rollup/plugin-commonjs";
import image from "@rollup/plugin-image";
import json from "@rollup/plugin-json";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import nodePolyfills from 'rollup-plugin-polyfill-node';
import pug from "rollup-plugin-pug";
import sass from "rollup-plugin-sass";
import { marked } from "./marked.js";
import { shapezMetadata } from "./metadata.js";
import { modSources, resolveModEntry } from "./mod_resolver.js";
import { shapez } from "./shapez_plugin.js";
import skimnet from "./skimnet.js";
import { resolveShapezModule, shapezExternal } from "./util.js";

const plugins = [
    // @ts-ignore invalid typings
    image(),
    // @ts-ignore invalid typings

    typescript(),
    // @ts-ignore invalid typings
    url({ limit: 0 }),
    // @ts-ignore invalid typings
    json({ exclude: "**/mod.json" }),
    sass(),
    // @ts-ignore invalid typings
    nodePolyfills( /* options */),
    pug({
        staticPattern: /\.(?:pug|jade)$/
    }),
    marked(),
    shapezMetadata(),
    shapez(),
    skimnet(),
    // @ts-ignore invalid typings
    terser(),
    // @ts-ignore invalid typings
    commonjs(),
    nodeResolve(),
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
