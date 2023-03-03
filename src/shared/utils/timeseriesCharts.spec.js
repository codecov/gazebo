import {
  calculateDayDifference,
  chartQuery,
  getTrendEnum,
  timeseriesRepoCoverageQuery,
  Trend,
} from './timeseriesCharts'

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

describe.each`
  value         | expected
  ${undefined}  | ${Trend.THREE_MONTHS}
  ${'7 days'}   | ${Trend.SEVEN_DAYS}
  ${'30 days'}  | ${Trend.THIRTY_DAYS}
  ${'3 months'} | ${Trend.THREE_MONTHS}
  ${'6 months'} | ${Trend.SIX_MONTHS}
  ${'all time'} | ${Trend.ALL_TIME}
`('getTrendEnum', ({ value, expected }) => {
  it(`${value} returns the expected value ${expected}`, () => {
    expect(getTrendEnum(value)).toBe(expected)
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

describe('timeseriesRepoCoverageQuery', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2022/01/01'))
  })

  afterAll(() => jest.useRealTimers())

  describe('dynamic params', () => {
    it('sets the start date', () => {
      expect(
        timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.SEVEN_DAYS,
          branch: 'main',
          today: new Date(),
        }).startDate
      ).toStrictEqual(new Date('2021/12/25'))
    })

    it('If today not set do not return a startDate', () => {
      expect(
        timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
        }).startDate
      ).toBe(undefined)
    })

    describe('groupingUnit', () => {
      it('invalid trend', () => {
        const { interval } = timeseriesRepoCoverageQuery({
          repo: 'critical role',
          branch: 'main',
          today: new Date(),
        })

        expect(interval).toBe('INTERVAL_30_DAY')
      })

      it('no start', () => {
        const { interval } = timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
        })

        expect(interval).toBe('INTERVAL_30_DAY')
      })

      it('all time', () => {
        const { interval } = timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
          today: new Date(),
        })

        expect(interval).toBe('INTERVAL_30_DAY')
      })

      it('last year', () => {
        const { interval } = timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.TWELVE_MONTHS,
          branch: 'main',
          today: new Date(),
        })

        expect(interval).toBe('INTERVAL_30_DAY')
      })

      it('seven days', () => {
        const { interval } = timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.SEVEN_DAYS,
          branch: 'main',
          today: new Date(),
        })

        expect(interval).toBe('INTERVAL_1_DAY')
      })

      it('six months', () => {
        const { interval } = timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.SIX_MONTHS,
          branch: 'main',
          today: new Date(),
        })

        expect(interval).toBe('INTERVAL_7_DAY')
      })

      it('30 days', () => {
        const { interval } = timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.THIRTY_DAYS,
          branch: 'main',
          today: new Date(),
        })

        expect(interval).toBe('INTERVAL_1_DAY')
      })

      it('3 months', () => {
        const { interval } = timeseriesRepoCoverageQuery({
          repo: 'critical role',
          trend: Trend.THREE_MONTHS,
          branch: 'main',
          today: new Date(),
        })

        expect(interval).toBe('INTERVAL_7_DAY')
      })
    })
  })
})
