import { defineArtifact } from './schema';
// Regression fixture: an older schemaVersion: 1 entry must still render unchanged.
export const legacyFixture = defineArtifact({
  schemaVersion: 1, slug: 'legacy-fixture', title: 'Old entry still renders', summary: 'Build-time regression fixture.',
  contributor: 'Fixture', status: 'archived', theme: 'paper',
  blocks: [{ id: 'start', type: 'text', heading: 'Still readable', body: 'The v1 contract remains supported.' }]
});
