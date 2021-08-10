#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

console.log(process.argv);

const folder = process.argv[2];
if (!folder || folder.length == 0) {
    console.error('Usage: npx js-to-ts <foldername>');
    console.error('No folder specified.');
    process.exit(1);
}

const exists = fs.existsSync(folder);
if (!exists) {
    console.error('Usage: npx js-to-ts <foldername>');
    console.error('No folder found.');
    process.exit(1);
}

function find(p: string, filter: string): string[] {

    let results: string[] = [];

    var files = fs.readdirSync(p);
    for (let i = 0; i < files.length; i++) {
        const name = path.join(p, files[i]);
        const stat = fs.lstatSync(name);
        if(files[i] === 'node_modules') {
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

function rename(ext1: string, ext2: string) {
    const files = find(folder, ext1);
    for(const file of files) {
        console.log(`Renaming ${file}...`);
        fs.renameSync(file, file.replace(ext1, ext2));
    }
}

rename('.jsx', '.tsx');
rename('.js', '.ts');

console.log('Done!!');
 