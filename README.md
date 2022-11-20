# jeek.js
Working on a script for Bitburner.

To build your own copy, run this as a script:
        export async function main(ns) {
                await ns.wget("https://raw.githubusercontent.com/jeek/jeek.js/dev/build.js", "build.js");
                await ns.wget("https://raw.githubusercontent.com/jeek/jeek.js/dev/clone.js", "clone.js");
        }

Then run this in your terminal:
        run clone.js
        run build.js
