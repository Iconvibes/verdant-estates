const { exec } = require('child_process');
const child = exec('npx vite --port 5173');
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
