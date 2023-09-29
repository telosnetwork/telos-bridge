import {createHash} from 'crypto';
import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';

const elementFilePath = fileURLToPath(new URL('../widget/element.mjs', import.meta.url));
const hash = createHash('sha384');
const checksum = hash.update(readFileSync(elementFilePath)).digest('base64');

writeFileSync(elementFilePath + '.sha384', checksum);
