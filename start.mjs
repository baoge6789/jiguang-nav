import { spawn } from 'child_process';
const child = spawn('npm', ['run', 'dev', '--', '-p', '3006'], {
    stdio: 'inherit',
    shell: true
});
