// Public exports from the codecovAI module
export { getRandomTopic } from './getRandomTopic';
export { useTopic } from './useTopic';

// Export types
export type { Topic } from './space';

// Export functions from the space module for direct access
import spaceModule from './space';
export const SpaceTopic = spaceModule.SpaceTopic;
export const CookingTopic = spaceModule.CookingTopic;
export const TechnologyTopic = spaceModule.TechnologyTopic;

export { useCodecovAIInstallation } from './useCodecovAIInstallation';
export { useCodecovAIInstalledRepos } from './useCodecovAIInstalledRepos';