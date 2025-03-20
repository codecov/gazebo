import { _getRandomTopic } from './space';

// This function acts as a public export of the internal _getRandomTopic function
// This allows us to test it and use it in other parts of the application
export function getRandomTopic() {
  return _getRandomTopic();
}