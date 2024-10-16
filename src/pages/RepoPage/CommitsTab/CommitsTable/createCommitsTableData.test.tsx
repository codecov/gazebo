import TotalsNumber from 'ui/TotalsNumber'

import {
  createCommitsTableData,
  ErroredUpload,
  PendingUpload,
} from './createCommitsTableData'
import Title from './Title'

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
    it('returns the name field', () => {
      const commitData = {
        ciPassed: true,
        message: 'Cool commit message',
        commitid: 'commit123',
        createdAt: '2023-04-25T15:38:48.046832',
        author: {
          username: 'cool-user',
          avatarUrl: 'http://127.0.0.1/avatar-url',
        },
        bundleStatus: 'COMPLETED',
        coverageStatus: 'COMPLETED',
        compareWithParent: {
          __typename: 'Comparison',
          patchTotals: {
            percentCovered: 100,
          },
        },
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'MissingHeadReport',
            message: 'Missing head report',
          },
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

    describe('coverage status is ERROR', () => {
      it('returns UploadError component', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          bundleStatus: 'ERROR',
          coverageStatus: 'ERROR',
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysis: {
            bundleAnalysisCompareWithParent: {
              __typename: 'BundleAnalysisComparison',
              bundleChange: {
                size: {
                  uncompress: 100,
                },
              },
            },
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.patch).toStrictEqual(<ErroredUpload />)
      })
    })

    describe('coverage status is PENDING', () => {
      it('returns PendingUpload component', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          bundleStatus: 'PENDING',
          coverageStatus: 'PENDING',
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysis: {
            bundleAnalysisCompareWithParent: {
              __typename: 'BundleAnalysisComparison',
              bundleChange: {
                size: {
                  uncompress: 100,
                },
              },
            },
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.patch).toStrictEqual(<PendingUpload />)
      })
    })

    describe('compareWithParent __typename is not Comparison', () => {
      it('returns a dash', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          bundleStatus: 'COMPLETED',
          coverageStatus: 'COMPLETED',
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysis: {
            bundleAnalysisCompareWithParent: {
              __typename: 'MissingHeadReport',
              message: 'Missing head report',
            },
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.patch).toStrictEqual(<p>-</p>)
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
          bundleStatus: 'COMPLETED',
          coverageStatus: 'COMPLETED',
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
          },
          bundleAnalysis: {
            bundleAnalysisCompareWithParent: {
              __typename: 'MissingHeadReport',
              message: 'Missing head report',
            },
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
        it('returns NAN value', () => {
          const commitData = {
            ciPassed: null,
            message: null,
            commitid: 'commit-123',
            createdAt: '2021-11-01T19:44:10.795533+00:00',
            author: null,
            bundleStatus: 'COMPLETED',
            coverageStatus: 'COMPLETED',
            compareWithParent: {
              __typename: 'Comparison',
              patchTotals: {
                percentCovered: null,
              },
            },
            bundleAnalysis: {
              bundleAnalysisCompareWithParent: {
                __typename: 'MissingHeadReport',
                message: 'Missing head report',
              },
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
              value={NaN}
            />
          )
        })
      })
    })

    describe('bundle status is ERROR', () => {
      it('returns UploadError component', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          bundleStatus: 'ERROR',
          coverageStatus: 'COMPLETED',
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysis: {
            bundleAnalysisCompareWithParent: {
              __typename: 'BundleAnalysisComparison',
              bundleChange: {
                size: {
                  uncompress: 100,
                },
              },
            },
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<ErroredUpload />)
      })
    })

    describe('bundle status is PENDING', () => {
      it('returns PendingUpload component', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          bundleStatus: 'PENDING',
          coverageStatus: 'COMPLETED',
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysis: {
            bundleAnalysisCompareWithParent: {
              __typename: 'BundleAnalysisComparison',
              bundleChange: {
                size: {
                  uncompress: 100,
                },
              },
            },
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<PendingUpload />)
      })
    })

    describe('bundleAnalysisReport __typename is not BundleAnalysisReport', () => {
      it('returns a -', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          bundleStatus: 'COMPLETED',
          coverageStatus: 'COMPLETED',
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysis: {
            bundleAnalysisCompareWithParent: {
              __typename: 'MissingHeadReport',
              message: 'Missing head report',
            },
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<p>-</p>)
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
          bundleStatus: 'COMPLETED',
          coverageStatus: 'COMPLETED',
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
          bundleAnalysis: {
            bundleAnalysisCompareWithParent: {
              __typename: 'BundleAnalysisComparison',
              bundleChange: {
                size: {
                  uncompress: 100,
                },
              },
            },
          },
        } as const

        const result = createCommitsTableData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.bundleAnalysis).toStrictEqual(<p>+100B</p>)
      })
    })
  })
})
