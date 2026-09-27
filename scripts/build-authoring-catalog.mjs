import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { protocol } from '../server/authoring/protocol.ts';

const documents = Object.fromEntries(Object.entries(protocol.documents).map(([id, path]) => {
  const content = readFileSync(path, 'utf8');
  return [id, { path, sha256: createHash('sha256').update(content).digest('hex'), content }];
}));
const artifacts = readdirSync('app/src/content').filter(f => f.endsWith('.json')).sort().map(f => {
  const { slug, title, summary, status, series } = JSON.parse(readFileSync(`app/src/content/${f}`, 'utf8'));
  return { slug, title, summary, status, ...(series ? { series } : {}), repositoryPath: `app/src/content/${f}` };
});
writeFileSync('server/authoring/catalog.json', JSON.stringify({ documents, artifacts }, null, 2) + '\n');
