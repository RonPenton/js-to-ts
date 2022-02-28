#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { spawn } from 'child_process';

const program = new Command();

program
    .name('js-files-to-ts')
    .description('Converts JS files to TS files by renaming the extension. You have to do the conversion of the code yourself.')
    .argument('<folder>')
    .option('-g, --git', 'use git mv command');

program.parse();

console.log(process.argv);

const folder = program.args[0];
const git = program.opts()['git'];

const exists = fs.existsSync(folder);
if (!exists) {
    console.error('No folder found.');
    process.exit(1);
}

function execute(command: string, ...args: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
        const exe = spawn(command, args);

        exe.stdout.on('data', data => console.log(data.toString()));
        exe.stderr.on('data', data => console.log(data.toString()));
        exe.on('close', code => {
            if (code === 0 || code === null) {
                resolve(code ?? 0);
                return;
            }
            reject(code);
        });

    });
}

function find(p: string, filter: string): string[] {

    let results: string[] = [];

    var files = fs.readdirSync(p);
    for (let i = 0; i < files.length; i++) {
        const name = path.join(p, files[i]);
        const stat = fs.lstatSync(name);
        if (files[i] === 'node_modules') {
            continue;
        }
        else if (stat.isDirectory()) {
            const subResults = find(name, filter);
            results = [...results, ...subResults];
        }
        else if (name.endsWith(filter)) {
            results.push(name);
        }
    }

    return results;
}

async function rename(ext1: string, ext2: string) {
    const files = find(folder, ext1);
    for (const file of files) {
        console.log(`Renaming ${file}...`);

        if (!git) {
            fs.renameSync(file, file.replace(ext1, ext2));
        }
        else {
            const newFile = file.replace(ext1, ext2);
            await execute('git', 'mv', file, newFile);
        }
    }
}

async function go() {
    await rename('.jsx', '.tsx');
    await rename('.js', '.ts');

    console.log('Done!!');
}

void go();
