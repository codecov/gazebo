import { renderHook, act } from '@testing-library/react';
import { useTopic } from './useTopic';
import * as spaceModule from './space';

// Mock implementations for our Topic classes
const mockSpaceTopic = {
  id: 1,
  name: 'Space',
  getFact: jest.fn().mockReturnValue('Space fact')
};

const mockCookingTopic = {
  id: 2,
  name: 'Cooking',
  getFact: jest.fn().mockReturnValue('Cooking fact')
};

// Mock the _getRandomTopic function
jest.mock('./space', () => ({
  _getRandomTopic: jest.fn()
}));

describe('useTopic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to returning the space topic
    (spaceModule._getRandomTopic as jest.Mock).mockReturnValue(mockSpaceTopic);
  });

  it('initializes with a random topic', () => {
    // Render the hook
    const { result } = renderHook(() => useTopic());
    
    // Check that _getRandomTopic was called during initialization
    expect(spaceModule._getRandomTopic).toHaveBeenCalledTimes(1);
    
    // Check that the hook returns the expected values
    expect(result.current.topic).toBe(mockSpaceTopic);
    expect(result.current.fact).toBe('Space fact');
  });

  it('provides a function to get a new random topic', () => {
    // Set up _getRandomTopic to return different topics on subsequent calls
    (spaceModule._getRandomTopic as jest.Mock)
      .mockReturnValueOnce(mockSpaceTopic)
      .mockReturnValueOnce(mockCookingTopic);
    
    // Render the hook
    const { result } = renderHook(() => useTopic());
    
    // Initially we should have the space topic
    expect(result.current.topic).toBe(mockSpaceTopic);
    expect(result.current.fact).toBe('Space fact');
    
    // Call getNewTopic to get a new random topic
    act(() => {
      result.current.getNewTopic();
    });
    
    // Now we should have the cooking topic
    expect(result.current.topic).toBe(mockCookingTopic);
    expect(result.current.fact).toBe('Cooking fact');
    
    // _getRandomTopic should have been called twice (once during init, once for getNewTopic)
    expect(spaceModule._getRandomTopic).toHaveBeenCalledTimes(2);
  });

  it('calls getFact on the current topic to get the fact', () => {
    // Render the hook
    renderHook(() => useTopic());
    
    // Check that getFact was called on the topic
    expect(mockSpaceTopic.getFact).toHaveBeenCalledTimes(1);
  });

  it('returns a stable getNewTopic function that does not change on rerenders', () => {
    // Render the hook
    const { result, rerender } = renderHook(() => useTopic());
    const initialGetNewTopic = result.current.getNewTopic;
    
    // Rerender the hook and check that getNewTopic is the same function
    rerender();
    expect(result.current.getNewTopic).toBe(initialGetNewTopic);
  });
});