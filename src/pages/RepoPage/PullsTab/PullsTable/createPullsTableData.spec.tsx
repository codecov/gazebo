import TotalsNumber from 'ui/TotalsNumber'

import Coverage from './Coverage'
import { createPullsTableData } from './createPullsTableData'

import Title from '../shared/Title'

describe('createPullsTableData', () => {
  describe('pulls is undefined', () => {
    it('returns an empty array', () => {
      const result = createPullsTableData({})

      expect(result).toStrictEqual([])
    })
  })

  describe('pulls is an empty array', () => {
    it('returns an empty array', () => {
      const result = createPullsTableData({ pulls: [] })

      expect(result).toStrictEqual([])
    })
  })

  describe('pulls in pages is empty', () => {
    it('returns an empty array', () => {
      const result = createPullsTableData({
        pulls: [],
      })

      expect(result).toStrictEqual([])
    })
  })

  describe('pulls in pages is undefined', () => {
    it('returns an empty array', () => {
      const result = createPullsTableData({
        pulls: undefined,
      })

      expect(result).toStrictEqual([])
    })
  })

  describe('pages has valid pulls', () => {
    describe('compareWithBase __typename is not Comparison', () => {
      it('returns undefined value for patch', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          compareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          head: {
            totals: {
              percentCovered: 0,
            },
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
            },
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.patch).toStrictEqual(
          <TotalsNumber
            large={false}
            light={false}
            plain={true}
            showChange={false}
            value={undefined}
          />
        )
      })

      it('returns undefined value for change', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          compareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          head: null,
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.change).toStrictEqual(
          <TotalsNumber
            data-testid="change-value"
            large={false}
            light={false}
            plain={true}
            showChange={true}
            value={undefined}
          />
        )
      })
    })

    describe('compareWithBase __typename is Comparison', () => {
      it('returns with patch value', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          head: {
            totals: {
              percentCovered: 9,
            },
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
            },
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.patch).toStrictEqual(
          <TotalsNumber
            large={false}
            light={false}
            plain={true}
            showChange={false}
            value={100}
          />
        )
      })

      it('returns with change value', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          head: {
            totals: {
              percentCovered: 9,
            },
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
            },
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.change).toStrictEqual(
          <TotalsNumber
            data-testid="change-value"
            large={false}
            light={false}
            plain={true}
            showChange={true}
            value={0}
          />
        )
      })

      describe('percent covered is null', () => {
        it('returns patch total of 0', () => {
          const pullData = {
            author: null,
            pullId: 123,
            state: 'OPEN',
            updatestamp: null,
            title: null,
            compareWithBase: {
              __typename: 'Comparison',
              patchTotals: {
                percentCovered: null,
              },
              changeCoverage: 9,
            },
            head: {
              totals: {
                percentCovered: 9,
              },
              bundleAnalysisReport: {
                __typename: 'MissingHeadReport',
              },
            },
          } as const

          const result = createPullsTableData({
            pulls: [pullData],
          })

          expect(result[0]?.patch).toStrictEqual(
            <TotalsNumber
              large={false}
              light={false}
              plain={true}
              showChange={false}
              value={0}
            />
          )
        })
      })
    })

    describe('pull details are all non-null values', () => {
      it('returns with coverage value', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          head: {
            totals: {
              percentCovered: 9,
            },
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
            },
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.coverage).toStrictEqual(
          <Coverage
            head={{
              totals: {
                percentCovered: 9,
              },
              bundleAnalysisReport: {
                __typename: 'MissingHeadReport',
              },
            }}
            pullId={123}
            state={'OPEN'}
          />
        )
      })

      it('returns the title component', () => {
        const pullData = {
          author: {
            username: 'cool-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          pullId: 123,
          state: 'OPEN',
          updatestamp: '2023-04-25T15:38:48.046832',
          title: 'super cool pull request',
          compareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          head: {
            totals: {
              percentCovered: 0,
            },
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
            },
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.title).toStrictEqual(
          <Title
            author={{
              avatarUrl: 'http://127.0.0.1/avatar-url',
              username: 'cool-user',
            }}
            compareWithBaseType="MissingBaseCommit"
            pullId={123}
            title="super cool pull request"
            updatestamp="2023-04-25T15:38:48.046832"
          />
        )
      })
    })

    describe('bundleAnalysisReport __typename is not BundleAnalysisReport', () => {
      it('returns x emoji', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          head: {
            totals: {
              percentCovered: 9,
            },
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
            },
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<>Upload: ❌</>)
      })
    })

    describe('bundleAnalysisReport __typename is BundleAnalysisReport', () => {
      it('returns successful upload', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          head: {
            totals: {
              percentCovered: 9,
            },
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
            },
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<>Upload: ✅</>)
      })
    })
  })
})
