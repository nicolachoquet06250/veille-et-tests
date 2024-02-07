import './style.css';
import 'xterm/css/xterm.css';
import typescriptLogo from './typescript.svg';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import files from './files';
// import { setupCounter } from './counter'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div> -->

  <div class="container">
    <div class="editor">
      <textarea>I am a textarea</textarea>
    </div>
    <div class="preview">
      <iframe src="http://localhost:5173/loading.html"></iframe>
    </div>
  </div>
  <div class="terminal"></div>
`;

const iframeEl = document.querySelector<HTMLIFrameElement>('iframe');
const textareaEl = document.querySelector<HTMLTextAreaElement>('textarea');
const terminalEl = document.querySelector<HTMLElement>('.terminal');

let terminal: Terminal | null =  null;

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);

let webcontainerInstance: WebContainer;

async function installDependencies(terminal: Terminal | null) {
  // Install dependencies
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);

  installProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal?.write(data);
    }
  }));

  // Wait for install command to exit
  return installProcess.exit;
};

async function downloadDenoInstallFile(terminal: Terminal | null) {
  const denoInstallProcess = await webcontainerInstance.spawn('node', ['install.js']);
  
  denoInstallProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal?.write(data);
    }
  }));

  return denoInstallProcess.exit;
}

async function installDeno(terminal: Terminal | null) {
  const denoInstallProcessStep2 = await webcontainerInstance.spawn('sh', ['deno-install.sh']);
  
  denoInstallProcessStep2.output.pipeTo(new WritableStream({
    write(data) {
      terminal?.write(data);
    }
  }));
}

// async function startDevServer(terminal: Terminal | null) {
//   // Run `npm run start` to start the Express app
//   const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);

//   serverProcess.output.pipeTo(
//     new WritableStream({
//       write(data) {
//         terminal?.write(data);
//       },
//     })
//   );

//   // Wait for `server-ready` event
//   webcontainerInstance.on('server-ready', (port, url) => {
//     if (iframeEl) {
//       iframeEl.src = url;
//     }
//   });
// };

async function writeIndexJS(content: string) {
  await webcontainerInstance.fs.writeFile('/index.js', content);
};

async function startShell(terminal: Terminal | null) {
  const shellProcess = await webcontainerInstance.spawn('jsh', {
    terminal: {
      cols: terminal?.cols ?? 0,
      rows: terminal?.rows ?? 0,
    },
  });
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal?.write(data);
      },
    })
  );

  const input = shellProcess.input.getWriter();
  terminal?.onData((data) => {
    input.write(data);
  });

  return shellProcess;
};

window.addEventListener('load', async () => {
  if (textareaEl) {
    textareaEl.value = files['index.js'].file.contents;
  }

  // @ts-ignore
  textareaEl?.addEventListener('input', (e: KeyboardEvent) => {
    const target: EventTarget | null = e.currentTarget;
    writeIndexJS(target?.value ?? '');
  });

  if (terminalEl) {
    const fitAddon = new FitAddon();

    terminal = new Terminal({
      convertEol: true,
    });
    terminal.loadAddon(fitAddon);
    terminal.open(terminalEl);

    fitAddon.fit();
  }

  // Call only once
  webcontainerInstance = await WebContainer.boot();
  webcontainerInstance.mount(files);

  const exitCode = await installDependencies(terminal);
  if (exitCode !== 0) {
    throw new Error('Installation failed');
  }

  const downloadDenoExitCode = await downloadDenoInstallFile(terminal);
  if (exitCode !== 0) {
    throw new Error('download deno failed');
  }
  const installDenoExitCode = await installDeno(terminal);
  if (exitCode !== 0) {
    throw new Error('Installation deno failed');
  }

  webcontainerInstance.on('server-ready', (_port, url) => {
    if (iframeEl) {
      iframeEl.src = url;
    }
  });

  startShell(terminal);

  // startDevServer(terminal);
});
