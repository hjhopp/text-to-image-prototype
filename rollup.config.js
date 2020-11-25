const production = !process.env.ROLLUP_WATCH;

function serve() {
    let server;

    function toExit() {
        if (server) {
            server.kill(0);
        }
    }

    return {
        writeBundle() {
            if (server) {
                return;
            }

            server = require("child_process").spawn(
                "npm",
                [ "run", "svelte-start", "--", "--dev" ],
                {
                    stdio : [ "ignore", "inherit", "inherit" ],
                    shell : true,
                }
            );

            process.on("SIGTERM", toExit);
            process.on("exit", toExit);
        }
    };
}

export default{
    input  : "src/main.js",
    output : {
        sourcemap      : true,
        format         : "iife",
        name           : "app",
        file           : "public/gen/bundle.js",
        assetFileNames : "[name][extname]"
    },
    plugins : [
        require("@rollup/plugin-commonjs")(),

        require("@rollup/plugin-node-resolve").nodeResolve({
            browser : true,
            dedupe  : [ "svelte" ]
        }),

        require("rollup-plugin-svelte")({
            dev        : !production,
            extensions : [ ".svelte" ],
            css        : (css) => css.write("bundle.css")
        }),

        !production && serve(),

        !production && require("rollup-plugin-livereload")("public")
    ],
    watch : {
        clearScreen : false
    }
};
