import { graphql } from 'msw'

export const randomFlagsHandler = graphql.query(
  'FlagsFilter',
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
