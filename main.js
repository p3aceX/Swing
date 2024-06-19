import { exec } from 'child_process';

function runScript(script) {
    return new Promise((resolve, reject) => {
        exec(`node ${script}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing ${script}:`, stderr);
                reject(error);
            } else {
                console.log(`Output from ${script}:`, stdout);
                resolve(stdout);
            }
        });
    });
}

async function main() {
    try {
        console.log('Generating SMI history...');
        await runScript('smi-index.js');
        
        console.log('Calculating premiums...');
        await runScript('option_premiums.mjs');

        console.log('Generating scorecard...');
        await runScript('performance.js');
        
        console.log('Starting server...');
        await runScript('server.js');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
