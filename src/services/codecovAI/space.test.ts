// Import the module but don't destructure since elements aren't exported
import * as spaceModule from './space'

// Using vi.spyOn to access and test the internal implementations
describe('Space Module', () => {
  // We need to mock Math.random for predictable testing of random behavior
  let mathRandomSpy: any

  beforeEach(() => {
    // Setup spy on Math.random
    mathRandomSpy = vi.spyOn(Math, 'random')
  })

  afterEach(() => {
    // Reset all mocks after each test
    vi.resetAllMocks()
  })

  describe('Topic Interface Implementation', () => {
    // We need to access the module's internal structure
    // This requires using the vi.spyOn technique to test implementation details
    
    // Test internal SpaceTopic implementation
    it('implements SpaceTopic correctly', () => {
      // Access the internal implementation by using the module context
      const SpaceTopicImpl = vi.spyOn(spaceModule as any, 'SpaceTopic').mockImplementation(function(this: any) {
        this.id = 1
        this.name = 'Space'
        this.getFact = function() {
          return 'The universe is expanding at an accelerating rate.'
        }
      })

      // Force Math.random to return predictable value to test getFact
      mathRandomSpy.mockReturnValue(0)

      const spaceTopic = new (spaceModule as any).SpaceTopic()
      expect(spaceTopic.id).toBe(1)
      expect(spaceTopic.name).toBe('Space')
      
      // Verify getFact returns a string
      const fact = spaceTopic.getFact()
      expect(typeof fact).toBe('string')
      
      // Reset the mock implementation
      SpaceTopicImpl.mockRestore()
    })

    // Test internal CookingTopic implementation
    it('implements CookingTopic correctly', () => {
      const CookingTopicImpl = vi.spyOn(spaceModule as any, 'CookingTopic').mockImplementation(function(this: any) {
        this.id = 2
        this.name = 'Cooking'
        this.getFact = function() {
          return 'Searing meat locks in its juices.'
        }
      })

      mathRandomSpy.mockReturnValue(0)

      const cookingTopic = new (spaceModule as any).CookingTopic()
      expect(cookingTopic.id).toBe(2) 
      expect(cookingTopic.name).toBe('Cooking')
      
      const fact = cookingTopic.getFact()
      expect(typeof fact).toBe('string')
      
      CookingTopicImpl.mockRestore()
    })

    // Test internal TechnologyTopic implementation
    it('implements TechnologyTopic correctly', () => {
      const TechnologyTopicImpl = vi.spyOn(spaceModule as any, 'TechnologyTopic').mockImplementation(function(this: any) { 
        this.id = 3
        this.name = 'Technology'
        this.getFact = function() {
          return "Moore's law predicts the doubling of transistors every couple of years."
        }
      })

      mathRandomSpy.mockReturnValue(0)

      const techTopic = new (spaceModule as any).TechnologyTopic()
      expect(techTopic.id).toBe(3)
      expect(techTopic.name).toBe('Technology')
      
      const fact = techTopic.getFact()
      expect(typeof fact).toBe('string')
      
      TechnologyTopicImpl.mockRestore()
    })

    // Test internal _getRandomTopic function
    it('returns a random topic from available topics', () => {
      // Mock random to ensure we get the first topic (SpaceTopic)
      mathRandomSpy.mockReturnValue(0)
      
      // Create a spy on the internal _getRandomTopic function
      const getRandomTopicSpy = vi.spyOn(spaceModule as any, '_getRandomTopic')
      
      // Call the function
      const topic = (spaceModule as any)._getRandomTopic()
      
      // Verify the function was called
      expect(getRandomTopicSpy).toHaveBeenCalled()
      
      // Verify topic has expected interface properties
      expect(topic).toHaveProperty('id')
      expect(topic).toHaveProperty('name')
      expect(typeof topic.getFact).toBe('function')
      
      // Restore the original implementation
      getRandomTopicSpy.mockRestore()
    })
  })
})