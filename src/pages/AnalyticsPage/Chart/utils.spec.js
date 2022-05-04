import { calculateDayDifference, chartQuery } from './utils'

describe('calculateDayDifference', () => {
  // Exporting and testing this on it's own due to it being difficult to test the charting lib
  describe('if only one date is provided set day difference to 0', () => {
    it('no end date provided', () => {
      const start = '2019-08-31T14:36:28.511Z'
      expect(calculateDayDifference({ start })).toBe(0)
    })

    it('no start date provided', () => {
      const end = '2019-08-31T14:36:28.511Z'
      expect(calculateDayDifference({ end })).toBe(0)
    })

    it('no date provided', () => {
      expect(calculateDayDifference({})).toBe(0)
    })
  })
  describe('returns the number of days difference given a range', () => {
    it('no end date provided', () => {
      const start = '2019-12-31T14:36:28.511Z'
      const end = '2020-08-31'
      expect(calculateDayDifference({ start, end })).toBe(244)
    })
  })
})

describe('chartQuery', () => {
  // Craft the query to be sent to graphql
  describe('groupingUnit', () => {
    it('when the range of dates is more then 180 days have past render the chart by weeks', () => {
      const startDate = '2019-12-31T14'
      const endDate = '2020-08-31'
      expect(chartQuery({ startDate, endDate }).groupingUnit).toBe('week')
    })
    it('when the range of dates is less then 180 days have past render the chart by days', () => {
      const startDate = '2019-12-31T14'
      const endDate = '2019-09-15'
      expect(chartQuery({ startDate, endDate }).groupingUnit).toBe('day')
    })
  })
  describe('startDate', () => {
    it('correct param is passed', () => {
      const startDate = '2019-12-31T14'
      expect(chartQuery({ startDate }).startDate).toBe(startDate)
    })
    it('incorrect param is passed', () => {
      expect(chartQuery({}).startDate).toBe(undefined)
    })
  })
  describe('endDate', () => {
    it('correct param is passed', () => {
      const endDate = '2019-12-31T14'
      expect(chartQuery({ endDate }).endDate).toBe(endDate)
    })
    it('incorrect param is passed', () => {
      expect(chartQuery({}).endDate).toBe(undefined)
    })
  })
  describe('repositories', () => {
    it('An array is passed', () => {
      const repositories = ['gazebo']
      expect(chartQuery({ repositories }).repositories).toBe(repositories)
    })
    it('An empty array', () => {
      const repositories = []
      expect(chartQuery({ repositories }).repositories).toBe(undefined)
    })
    it('nothing is passed', () => {
      expect(chartQuery({}).repositories).toBe(undefined)
    })
  })
})
