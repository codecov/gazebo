import { graphql, HttpResponse } from 'msw2'

export const flagsSelectHandler = graphql.query('FlagsSelect', (info) => {
  return HttpResponse.json({
    data: {
      owner: {
        repository: {
          __typename: 'Repository',
          coverageAnalytics: {
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
      },
    },
  })
})

export const flagMeasurementsHandler = graphql.query(
  'FlagMeasurements',
  (info) => {
    return HttpResponse.json({
      data: {
        owner: {
          repository: {
            coverageAnalytics: {
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
        },
      },
    })
  }
)

export const backfillFlagMembershipsHandler = graphql.query(
  'BackfillFlagMemberships',
  (info) => {
    return HttpResponse.json({
      data: {
        config: {
          isTimescaleEnabled: true,
        },
        owner: {
          repository: {
            __typename: 'Repository',
            coverageAnalytics: {
              flagsMeasurementsActive: true,
              flagsMeasurementsBackfilled: true,
              flagsCount: 12,
            },
          },
        },
      },
    })
  }
)
