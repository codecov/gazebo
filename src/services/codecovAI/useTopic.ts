import { useState, useCallback } from 'react';
import { _getRandomTopic } from './space';

/**
 * A React hook that provides a random topic and a way to refresh it
 * @returns An object containing the current topic and a function to get a new random topic
 */
export function useTopic() {
  const [topic, setTopic] = useState(() => spaceModule._getRandomTopic());
  
  // Function to get a new random topic
  const getNewTopic = useCallback(() => {
    setTopic(spaceModule._getRandomTopic());
  }, []);

  // Get a fact from the current topic
  const getCurrentFact = useCallback(() => {
    return topic.getFact();
  }, [topic]);

  // Return the topic, fact, and refresh function
  return { topic, fact: getCurrentFact(), getNewTopic };
}