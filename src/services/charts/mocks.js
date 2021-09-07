/* eslint-disable camelcase */
import { rest } from 'msw'
import faker from 'faker'

const chartUri = '/internal/charts/:provider/:owner/coverage/organization'

export const orgCoverageHandler = rest.get(chartUri, (req, res, ctx) => {
  // This is maybe a bit redundent atm but I would like to test some data mutation utils later
  const query = req.url.searchParams
  if (query.get('grouping_unit') === 'yearly') {
    return res(ctx.status(200), ctx.json(exampleYearlyRes))
  } else if (query.get('grouping_unit') === 'quarterly') {
    return res(ctx.status(200), ctx.json(exampleQuarterRes))
  }
})

const createCoverage = () => ({
  date: faker.date.between('2020-01-01', '2020-12-30'),
  total_hits: faker.datatype.number({ min: 0, max: 100 }),
  total_misses: faker.datatype.number({ min: 0, max: 100 }),
  total_partials: faker.datatype.number({ min: 0, max: 100 }),
  total_lines: faker.datatype.number({ min: 0, max: 100 }),
  coverage: faker.datatype.float({ min: 0, max: 100 }),
})

export const randomOrgCoverageHandler = rest.get(chartUri, (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      coverage: [
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
        createCoverage(),
      ],
    })
  )
})

export const exampleQuarterRes = {
  coverage: [
    {
      date: '2020-04-01T00:00:00Z',
      total_hits: 4.0,
      total_misses: 0.0,
      total_partials: 0.0,
      total_lines: 4.0,
      coverage: 100.0,
    },
    {
      date: '2020-07-01T00:00:00Z',
      total_hits: 4.0,
      total_misses: 0.0,
      total_partials: 0.0,
      total_lines: 4.0,
      coverage: 100.0,
    },
    {
      date: '2020-10-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-01-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-04-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-07-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
  ],
}

export const exampleYearlyRes = {
  coverage: [
    {
      date: '2020-01-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-01-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
  ],
}
