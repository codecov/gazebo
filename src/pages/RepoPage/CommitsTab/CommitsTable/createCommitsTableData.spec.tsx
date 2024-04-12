import TotalsNumber from 'ui/TotalsNumber'

import { createCommitsTableData } from './createCommitsTableData'

import CIStatus from '../shared/CIStatus'
import Title from '../shared/Title'

describe('createCommitsTableData', () => {
  describe('pages is undefined', () => {
    it('returns an empty array', () => {
      const result = createCommitsTableData({})

      expect(result).toStrictEqual([])
    })
  })

  describe('pages is an empty array', () => {
    it('returns an empty array', () => {
      const result = createCommitsTableData({ pages: [] })

      expect(result).toStrictEqual([])
    })
  })

  describe('commits in pages is empty', () => {
    it('returns an empty array', () => {
      const result = createCommitsTableData({
        pages: [{ commits: [] }, { commits: [] }],
      })

      expect(result).toStrictEqual([])
    })
  })

  describe('pages has valid commits', () => {
    describe('compareWithParent __typename is not Comparison', () => {
      it('returns a dash', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 0,
            },
          },
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.patch).toStrictEqual(<p className="text-right">-</p>)
      })
    })

    describe('compareWithParent __typename is Comparison', () => {
      it('returns with patch value', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 0,
            },
          },
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
          },
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
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

      describe('percent covered is null', () => {
        it('returns patch total of 0', () => {
          const commitData = {
            ciPassed: null,
            message: null,
            commitid: 'commit-123',
            createdAt: '2021-11-01T19:44:10.795533+00:00',
            author: null,
            totals: {
              coverage: 100,
            },
            parent: {
              totals: {
                coverage: 0,
              },
            },
            compareWithParent: {
              __typename: 'Comparison',
              patchTotals: {
                percentCovered: null,
              },
            },
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
            },
          } as const

          const result = createCommitsTableData({
            pages: [{ commits: [commitData] }],
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

    describe('commit details are all non-null values', () => {
      it('returns the name component', () => {
        const commitData = {
          ciPassed: true,
          message: 'Cool commit message',
          commitid: 'commit123',
          createdAt: '2023-04-25T15:38:48.046832',
          author: {
            username: 'cool-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 0,
            },
          },
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
          },
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.name).toStrictEqual(
          <Title
            author={{
              avatarUrl: 'http://127.0.0.1/avatar-url',
              username: 'cool-user',
            }}
            commitid="commit123"
            createdAt="2023-04-25T15:38:48.046832"
            message="Cool commit message"
          />
        )
      })

      it('returns the ciStatus column', () => {
        const commitData = {
          ciPassed: true,
          message: 'Cool commit message',
          commitid: 'commit123',
          createdAt: '2023-04-25T15:38:48.046832',
          author: {
            username: 'cool-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 0,
            },
          },
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
          },
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.ciStatus).toStrictEqual(
          <CIStatus ciPassed={true} commitid="commit123" coverage={100} />
        )
      })

      it('returns coverage column', () => {
        const commitData = {
          ciPassed: true,
          message: 'Cool commit message',
          commitid: 'commit123',
          createdAt: '2023-04-25T15:38:48.046832',
          author: {
            username: 'cool-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 0,
            },
          },
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
          },
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.coverage).toStrictEqual(
          <TotalsNumber
            plain
            large={false}
            light={false}
            value={100}
            showChange={false}
          />
        )
      })

      it('returns change column', () => {
        const commitData = {
          ciPassed: true,
          message: 'Cool commit message',
          commitid: 'commit123',
          createdAt: '2023-04-25T15:38:48.046832',
          author: {
            username: 'cool-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: null,
            },
          },
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 99,
            },
          },
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.change).toEqual(
          <TotalsNumber large={false} light={false} showChange={true} />
        )
      })
    })

    describe('bundleAnalysisReport __typename is not BundleAnalysisReport', () => {
      it('returns an x emoji', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 0,
            },
          },
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysisReport: {
            __typename: 'MissingHeadReport',
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<>Upload: ❌</>)
      })
    })

    describe('bundleAnalysisReport __typename is BundleAnalysisReport', () => {
      it('returns checkmark emoji', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 0,
            },
          },
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<>Upload: ✅</>)
      })
    })
  })
})
