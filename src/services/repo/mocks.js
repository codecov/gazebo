import { graphql } from 'msw'

export const flagsSelectHandler = graphql.query(
  'FlagsSelect',
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({
        owner: {
          repository: {
            __typename: 'Repository',
            flags: {
              pageInfo: {
                hasNextPage: false,
                endCursor: 'bGF0ZXN0LXVwbG9hZGVy',
              },
              edges: [
                {
                  node: {
                    name: 'unit-python-uploader',
                  },
                },
                {
                  node: {
                    name: 'unit-latest-uploader',
                  },
                },
                {
                  node: {
                    name: 'unit',
                  },
                },
                {
                  node: {
                    name: 'new_python_uploader',
                  },
                },
                {
                  node: {
                    name: 'latest-uploader',
                  },
                },
              ],
            },
          },
        },
      })
    )
  }
)

export const flagMeasurementsHandler = graphql.query(
  'FlagMeasurements',
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({
        owner: {
          repository: {
            flags: {
              pageInfo: {
                hasNextPage: false,
                endCursor: 'bGF0ZXN0LXVwbG9hZGVy',
              },
              edges: [
                {
                  node: {
                    name: 'unit-python-uploader',
                    percentCovered: null,
                    measurements: [],
                  },
                },
                {
                  node: {
                    name: 'unit-latest-uploader',
                    percentCovered: null,
                    measurements: [],
                  },
                },
                {
                  node: {
                    name: 'unit',
                    percentCovered: null,
                    measurements: [],
                  },
                },
                {
                  node: {
                    name: 'new_python_uploader',
                    percentCovered: null,
                    measurements: [],
                  },
                },
                {
                  node: {
                    name: 'latest-uploader',
                    percentCovered: null,
                    measurements: [],
                  },
                },
              ],
            },
          },
        },
      })
    )
  }
)

export const backfillFlagMembershipsHandler = graphql.query(
  'BackfillFlagMemberships',
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({
        config: {
          isTimescaleEnabled: true,
        },
        owner: {
          repository: {
            __typename: 'Repository',
            flagsMeasurementsActive: true,
            flagsMeasurementsBackfilled: true,
            flagsCount: 12,
          },
        },
      })
    )
  }
)
