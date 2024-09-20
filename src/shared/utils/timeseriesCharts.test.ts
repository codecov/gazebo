import {
  analyticsQuery,
  calculateDayDifference,
  createTimeSeriesQueryVars,
  getTrendEnum,
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

describe('analyticsQuery', () => {
  // Craft the query to be sent to graphql
  describe('interval', () => {
    describe('when the day difference is greater then one', () => {
      describe('day difference is less then day threshold', () => {
        it('returns single day interval', () => {
          const startDate = new Date('2020-01-01')
          const endDate = new Date('2020-01-03')

          const { interval } = analyticsQuery({
            startDate,
            endDate,
            repositories: [],
          })
          expect(interval).toBe('INTERVAL_1_DAY')
        })
      })

      describe('day difference is between day and month threshold', () => {
        it('returns week interval', () => {
          const startDate = new Date('2020-01-01')
          const endDate = new Date('2020-07-19')

          const { interval } = analyticsQuery({
            startDate,
            endDate,
            repositories: [],
          })
          expect(interval).toBe('INTERVAL_7_DAY')
        })
      })

      describe('when day difference is greater then month threshold', () => {
        it('returns month interval', () => {
          const startDate = new Date('2020-01-01')
          const endDate = new Date('2020-12-31')

          const { interval } = analyticsQuery({
            startDate,
            endDate,
            repositories: [],
          })
          expect(interval).toBe('INTERVAL_30_DAY')
        })
      })
    })

    describe('when the day difference is less than one', () => {
      it('returns week interval', () => {
        const startDate = new Date('2020-01-01')
        const endDate = new Date('2020-01-01')

        const { interval } = analyticsQuery({
          startDate,
          endDate,
          repositories: [],
        })
        expect(interval).toBe('INTERVAL_7_DAY')
      })
    })
  })

  describe('startDate', () => {
    it('correct param is passed', () => {
      const startDate = new Date('2019-12-31T14')
      expect(analyticsQuery({ startDate }).startDate).toBe(startDate)
    })

    it('incorrect param is passed', () => {
      expect(analyticsQuery({}).startDate).toBe(undefined)
    })
  })
  describe('endDate', () => {
    it('correct param is passed', () => {
      const endDate = new Date('2019-12-31T14')
      expect(analyticsQuery({ endDate }).endDate).toBe(endDate)
    })

    it('incorrect param is passed', () => {
      expect(analyticsQuery({}).endDate).toBe(undefined)
    })
  })
  describe('repositories', () => {
    it('An array is passed', () => {
      const repositories = ['gazebo']
      expect(analyticsQuery({ repositories }).repositories).toBe(repositories)
    })
    it('An empty array', () => {
      const repositories: string[] = []
      expect(analyticsQuery({ repositories }).repositories).toBe(undefined)
    })

    it('nothing is passed', () => {
      expect(analyticsQuery({}).repositories).toBe(undefined)
    })
  })
})

describe('createTimeSeriesQueryVars', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2022/01/01'))
  })

  afterAll(() => vi.useRealTimers())

  describe('dynamic params', () => {
    it('sets the start date', () => {
      expect(
        createTimeSeriesQueryVars({
          today: new Date(),
          trend: Trend.SEVEN_DAYS,
          oldestCommit: new Date('2010-01-01'),
        }).after
      ).toStrictEqual(new Date('2021/12/25'))
    })

    describe('groupingUnit', () => {
      it('no start', () => {
        const { interval } = createTimeSeriesQueryVars({
          trend: Trend.ALL_TIME,
          today: new Date(),
          oldestCommit: new Date('2010-01-01'),
        })

        expect(interval).toBe('INTERVAL_30_DAY')
      })

      it('all time', () => {
        const { interval } = createTimeSeriesQueryVars({
          trend: Trend.ALL_TIME,
          today: new Date(),
          oldestCommit: new Date('2010-01-01'),
        })

        expect(interval).toBe('INTERVAL_30_DAY')
      })

      it('last year', () => {
        const { interval } = createTimeSeriesQueryVars({
          trend: Trend.TWELVE_MONTHS,
          today: new Date(),
          oldestCommit: new Date('2010-01-01'),
        })

        expect(interval).toBe('INTERVAL_30_DAY')
      })

      it('seven days', () => {
        const { interval } = createTimeSeriesQueryVars({
          trend: Trend.SEVEN_DAYS,
          today: new Date(),
          oldestCommit: new Date('2010-01-01'),
        })

        expect(interval).toBe('INTERVAL_1_DAY')
      })

      it('six months', () => {
        const { interval } = createTimeSeriesQueryVars({
          trend: Trend.SIX_MONTHS,
          today: new Date(),
          oldestCommit: new Date('2010-01-01'),
        })

        expect(interval).toBe('INTERVAL_7_DAY')
      })

      it('30 days', () => {
        const { interval } = createTimeSeriesQueryVars({
          trend: Trend.THIRTY_DAYS,
          today: new Date(),
          oldestCommit: new Date('2010-01-01'),
        })

        expect(interval).toBe('INTERVAL_1_DAY')
      })

      it('3 months', () => {
        const { interval } = createTimeSeriesQueryVars({
          trend: Trend.THREE_MONTHS,
          today: new Date(),
          oldestCommit: new Date('2010-01-01'),
        })

        expect(interval).toBe('INTERVAL_7_DAY')
      })
    })
  })
})
