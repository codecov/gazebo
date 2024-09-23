import {
  calculateDayDifference,
  chartQuery,
  getTrendEnum,
  legacyRepoCoverageQuery,
  Trend,
} from './legacyCharts'

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
  ${'24 HOURS'} | ${Trend.TWENTY_FOUR_HOURS}
  ${'24 hours'} | ${Trend.TWENTY_FOUR_HOURS}
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

describe('legacyRepoCoverageQuery', () => {
  function setup(props) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2022/01/01'))

    return legacyRepoCoverageQuery(props)
  }
  afterAll(() => vi.useRealTimers())

  describe('static params', () => {
    it('aggFunction', () => {
      expect(
        setup({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
          today: new Date(),
        }).aggFunction
      ).toBe('max')
    })
    it('aggValue', () => {
      expect(
        setup({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
          today: new Date(),
        }).aggValue
      ).toBe('timestamp')
    })
    it('coverageTimestampOrdering', () => {
      expect(
        setup({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
          today: new Date(),
        }).coverageTimestampOrdering
      ).toBe('increasing')
    })
  })
  describe('dynamic params', () => {
    it('branch', () => {
      expect(
        setup({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
          today: new Date(),
        }).branch
      ).toBe('main')
    })

    it('repository', () => {
      expect(
        setup({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
          today: new Date(),
        }).repositories
      ).toStrictEqual(['critical role'])
    })

    it('sets the start date', () => {
      expect(
        setup({
          repo: 'critical role',
          trend: Trend.SEVEN_DAYS,
          branch: 'main',
          today: new Date(),
        }).startDate
      ).toStrictEqual(new Date('2021/12/25'))
    })

    it('If today not set do not return a startDate', () => {
      expect(
        setup({
          repo: 'critical role',
          trend: Trend.ALL_TIME,
          branch: 'main',
        }).startDate
      ).toBe(undefined)
    })

    describe('groupingUnit', () => {
      it('invalid trend', () => {
        expect(
          setup({
            repo: 'critical role',
            branch: 'main',
            today: new Date(),
          }).groupingUnit
        ).toBe('month')
      })
      it('no start', () => {
        expect(
          setup({
            repo: 'critical role',
            trend: Trend.ALL_TIME,
            branch: 'main',
          }).groupingUnit
        ).toBe('month')
      })
      it('all time', () => {
        expect(
          setup({
            repo: 'critical role',
            trend: Trend.ALL_TIME,
            branch: 'main',
            today: new Date(),
          }).groupingUnit
        ).toBe('month')
      })

      it('last year', () => {
        expect(
          setup({
            repo: 'critical role',
            trend: Trend.TWELVE_MONTHS,
            branch: 'main',
            today: new Date(),
          }).groupingUnit
        ).toBe('month')
      })

      it('seven days', () => {
        expect(
          setup({
            repo: 'critical role',
            trend: Trend.SEVEN_DAYS,
            branch: 'main',
            today: new Date(),
          }).groupingUnit
        ).toBe('hour')
      })

      it('six months', () => {
        expect(
          setup({
            repo: 'critical role',
            trend: Trend.SIX_MONTHS,
            branch: 'main',
            today: new Date(),
          }).groupingUnit
        ).toBe('week')
      })

      it('30 days', () => {
        expect(
          setup({
            repo: 'critical role',
            trend: Trend.THIRTY_DAYS,
            branch: 'main',
            today: new Date(),
          }).groupingUnit
        ).toBe('day')
      })

      it('3 months', () => {
        expect(
          setup({
            repo: 'critical role',
            trend: Trend.THREE_MONTHS,
            branch: 'main',
            today: new Date(),
          }).groupingUnit
        ).toBe('week')
      })

      it('24 hours', () => {
        expect(
          setup({
            repo: 'critical role',
            trend: Trend.TWENTY_FOUR_HOURS,
            branch: 'main',
            today: new Date(),
          }).groupingUnit
        ).toBe('hour')
      })
    })
  })
})
