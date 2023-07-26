const date = new Date().toString();
// const user = require("os").userInfo().username;

require("esbuild").build({
    // the entry point file described above
    entryPoints: ["index.ts"],
    // the build folder location described above
    outfile: "index-bundle.js",
    bundle: true,
    minify: false,
    watch: false,
    define: {"BUILD_DATE": JSON.stringify(date /* + ", "+user*/)},
    // Replace with the browser versions you need to target
    target: ["chrome60", "firefox60", "safari11", "edge20"],
    // In dev mode, include sources in the source mapping; otherwise, do not.
    sourcesContent: true,
    sourcemap: "inline",
    // logLevel: "verbose",
}).then(() => {
    console.log("completed building index.");
}).catch(() => {
    process.exit(1);
});
