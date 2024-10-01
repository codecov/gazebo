import TotalsNumber from 'ui/TotalsNumber'

import {
  createPullsTableData,
  ErroredUpload,
  PendingUpload,
} from './createPullsTableData'
import Title from './Title'

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
    describe('pull details are all non-null values', () => {
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
          head: {
            bundleStatus: 'COMPLETED',
            coverageStatus: 'COMPLETED',
          },
          compareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
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

    describe('coverage upload has had an error', () => {
      it('displays Upload: ❌', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          head: {
            bundleStatus: 'ERROR',
            coverageStatus: 'ERROR',
          },
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.patch).toStrictEqual(<ErroredUpload />)
      })
    })

    describe('coverage upload is pending', () => {
      it('displays Upload: ⏳', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          head: {
            bundleStatus: 'PENDING',
            coverageStatus: 'PENDING',
          },
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.patch).toStrictEqual(<PendingUpload />)
      })
    })

    describe('coverage upload is completed, and compareWithBase __typename is Comparison', () => {
      it('renders the TotalsNumber component', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          head: {
            bundleStatus: 'COMPLETED',
            coverageStatus: 'COMPLETED',
          },
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
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
    })

    describe('coverage upload does not match any conditions', () => {
      it('displays `-`', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          head: {
            bundleStatus: 'COMPLETED',
            coverageStatus: 'COMPLETED',
          },
          compareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.patch).toStrictEqual(<p>-</p>)
      })
    })

    describe('bundle upload has had an error', () => {
      it('displays Upload: ❌', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          head: {
            bundleStatus: 'ERROR',
            coverageStatus: 'COMPLETED',
          },
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<ErroredUpload />)
      })
    })

    describe('bundle upload is pending', () => {
      it('displays Upload: ⏳', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          head: {
            bundleStatus: 'PENDING',
            coverageStatus: 'COMPLETED',
          },
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<PendingUpload />)
      })
    })

    describe('bundleAnalysisCompareWithBase __typename is BundleAnalysisReport', () => {
      it('returns successful upload', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          head: {
            bundleStatus: 'COMPLETED',
            coverageStatus: 'COMPLETED',
          },
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'BundleAnalysisComparison',
            bundleChange: {
              size: {
                uncompress: 1000,
              },
            },
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<p>+1kB</p>)
      })
    })

    describe('bundle upload does not match any conditions', () => {
      it('displays `-`', () => {
        const pullData = {
          author: null,
          pullId: 123,
          state: 'OPEN',
          updatestamp: null,
          title: null,
          head: {
            bundleStatus: 'COMPLETED',
            coverageStatus: 'COMPLETED',
          },
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
            changeCoverage: 0,
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
        } as const

        const result = createPullsTableData({
          pulls: [pullData],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<p>-</p>)
      })
    })
  })
})
