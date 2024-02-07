import { exec } from 'child_process';
import fs from 'fs';

fetch('https://deno.land/x/install/install.sh')
    .then(r => r.text())
    .then(sh => {
        fs.writeFileSync('./deno-install.sh', sh);

        exec('./deno-install.sh');
    });