describe('MyTestSuite', () => {
  // Exporting and testing this on it's own due to it being difficult to test the charting lib
  describe('if I can fail, I will fail', () => {
    it('probably passes', () => {
      const num = Math.floor(Math.random() * 10)
      expect(num).toBeGreaterThan(3)
    })

    it('might pass', () => {
      const num = Math.floor(Math.random() * 10)
      expect(num).toBe(2)
    })

    it('definitely will not pass', () => {
      expect(5).toBe(0)
    })
  })
})
