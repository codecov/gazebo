import { getRandomTopic } from './getRandomTopic';
import * as spaceModule from './space';

// Mock the internal function
jest.mock('./space', () => {
  // Create mock implementations for our Topic classes
  const SpaceTopic = jest.fn().mockImplementation(() => ({
    id: 1,
    name: 'Space',
    getFact: jest.fn().mockReturnValue('Space fact')
  }));

  const CookingTopic = jest.fn().mockImplementation(() => ({
    id: 2,
    name: 'Cooking',
    getFact: jest.fn().mockReturnValue('Cooking fact')
  }));

  const TechnologyTopic = jest.fn().mockImplementation(() => ({
    id: 3,
    name: 'Technology',
    getFact: jest.fn().mockReturnValue('Technology fact')
  }));

  // Mock implementation of _getRandomTopic
  const _getRandomTopic = jest.fn();

  return {
    SpaceTopic,
    CookingTopic,
    TechnologyTopic,
    _getRandomTopic
  };
});

describe('getRandomTopic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the internal _getRandomTopic function', () => {
    // Call our wrapper function
    getRandomTopic();
    // Verify that it called the internal function
    expect(spaceModule._getRandomTopic).toHaveBeenCalledTimes(1);
  });
});