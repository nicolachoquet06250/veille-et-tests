export default {
    'index.js': {
        file: {
            contents: /*javascript*/`
import express from 'express';

const app = express();
const port = 3111;

app.get('/', (req, res) => {
    res.send(\`
        Welcome to a WebContainers app! 🥳 <br>
        <a href="/toto/10">toto 10</a> | <a href="/toto/11">toto 11</a> | <a href="/toto/12">toto 12</a> <br>
        <button>
            test post
        </button>
        <div></div>

        <script>
            document.querySelector('button').addEventListener('click', handleClick);

            function handleClick() {
                fetch('/data/10', {
                    method: 'post'
                })
                    .then(r => r.json())
                    .then(d => {
                        console.log(d);
                        document.querySelector('div').innerHTML = JSON.stringify(d, null, '\t');
                    });
            }
        </script>
    \`);
});

app.get('/toto/:id', (req, res) => {
    res.send(\`
        Welcome to a WebContainers app! 🥳\${req.params.id} <br>
        <a href="/">back</a>
    \`);
});

app.post('/data/:id', (req, res) => {
    res.send({
        id: req.params.id
    });
});

app.listen(port, () => {
    console.log(\`App is live at http://localhost:\${port}\`);
});`
        }
    },
    'package.json': {
        file: {
            contents: JSON.stringify({
                name: "example-app",
                type: "module",
                dependencies: {
                    express: "latest",
                    nodemon: "latest",
                    "node-fetch": "latest"
                },
                scripts: {
                    start: "nodemon --watch './' index.js"
                }
            })
        }
    },
    'install.js': {
        file: {
            contents: /*javascript*/`
            import fs from 'fs';
            import fetch from "node-fetch";

            fetch('https://deno.land/x/install/install.sh')
                .then(r => r.text())
                .then(sh => {
                    fs.writeFileSync('./deno-install.sh', sh);
                });
            `
        }
    },
    'deno.js': {
        file: {
            contents: `
#!/usr/bin/env -S npx jsh
# Copyright 2019 the Deno authors. All rights reserved. MIT license.
# TODO(everyone): Keep this script simple and easily auditable.

set -e

if ! command -v unzip >/dev/null; then
        echo "Error: unzip is required to install Deno (see: https://github.com/denoland/deno_install#unzip-is-required )." 1>&2
        exit 1
fi

if [ "$OS" = "Windows_NT" ]; then
        target="x86_64-pc-windows-msvc"
else
        case $(uname -sm) in
        "Darwin x86_64") target="x86_64-apple-darwin" ;;
        "Darwin arm64") target="aarch64-apple-darwin" ;;
        "Linux aarch64")
                echo "Error: Official Deno builds for Linux aarch64 are not available. (see: https://github.com/denoland/deno/issues/1846 )" 1>&2
                exit 1
                ;;
        *) target="x86_64-unknown-linux-gnu" ;;
        esac
fi

if [ $# -eq 0 ]; then
        deno_uri="https://github.com/denoland/deno/releases/latest/download/deno-\${target}.zip"
else
        deno_uri="https://github.com/denoland/deno/releases/download/\${1}/deno-\${target}.zip"
fi

deno_install="\${DENO_INSTALL:-$HOME/.deno}"
bin_dir="$deno_install/bin"
exe="$bin_dir/deno"

if [ ! -d "$bin_dir" ]; then
        mkdir -p "$bin_dir"
fi

curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"
unzip -d "$bin_dir" -o "$exe.zip"
chmod +x "$exe"
rm "$exe.zip"

echo "Deno was installed successfully to $exe"
if command -v deno >/dev/null; then
        echo "Run 'deno --help' to get started"
else
        case $SHELL in
        /bin/zsh) shell_profile=".zshrc" ;;
        *) shell_profile=".bashrc" ;;
        esac
        echo "Manually add the directory to your \$HOME/$shell_profile (or similar)"
        echo "  export DENO_INSTALL=\"$deno_install\""
        echo "  export PATH=\"\$DENO_INSTALL/bin:\$PATH\""
        echo "Run '$exe --help' to get started"
fi
echo
echo "Stuck? Join our Discord https://discord.gg/deno"
            `
        }
    }
};