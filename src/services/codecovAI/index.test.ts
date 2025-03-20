import * as codecovAI from './index';

// This is a simple test to ensure the exports are working correctly
describe('codecovAI module exports', () => {
  it('exports getRandomTopic', () => {
    expect(codecovAI.getRandomTopic).toBeDefined();
  });

  it('exports useTopic', () => {
    expect(codecovAI.useTopic).toBeDefined();
  });

  it('exports the Topic classes', () => {
    expect(codecovAI.SpaceTopic).toBeDefined();
    expect(codecovAI.CookingTopic).toBeDefined();
    expect(codecovAI.TechnologyTopic).toBeDefined();
  });
  it('exports the existing hooks', () => {
    expect(codecovAI.useCodecovAIInstallation).toBeDefined();
    expect(codecovAI.useCodecovAIInstalledRepos).toBeDefined();
  });
});