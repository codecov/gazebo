import { graphql } from 'msw'

export const myExample = graphql.query('Commit', (req, res, ctx) => {
  return res(ctx.status(200), ctx.data(myExampleData))
})

export const commitErrored = graphql.query('Commit', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        repository: {
          commit: commitDataError,
        },
      },
    })
  )
})

export const commitOnePending = graphql.query('Commit', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        repository: {
          commit: {
            ...commitDataError,
            uploads: {
              edges: [
                {
                  node: {
                    state: 'PENDING',
                    provider: 'travis',
                    createdAt: '2020-08-25T16:36:19.559474+00:00',
                    updatedAt: '2020-08-25T16:36:19.679868+00:00',
                    downloadUrl: '/test.txt',
                    ciUrl: 'https://example.com',
                    uploadType: 'UPLOADED',
                    jobCode: '1234',
                    buildCode: '1234',
                    flags: ['unit'],
                  },
                },
              ],
            },
          },
        },
      },
    })
  )
})

export const commitEmptyUploads = graphql.query('Commit', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        repository: {
          commit: commitDataEmpty,
        },
      },
    })
  )
})

export const compareTotalsEmpty = graphql.query(
  'CompareTotals',
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.data({}))
  }
)

const commitDataError = {
  totals: {
    coverage: 38.30846,
    diff: {
      coverage: null,
    },
  },
  commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
  pullId: 10,
  createdAt: '2020-08-25T16:35:32',
  author: {
    username: 'febg',
  },
  state: 'ERROR',
  uploads: {
    edges: [
      {
        node: {
          state: 'ERROR',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          downloadUrl: '/test.txt',
          ciUrl: 'https://example.com',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
          flags: ['unit'],
          errors: {
            edges: [
              {
                node: {
                  errorCode: 'REPORT_EMPTY',
                },
              },
            ],
          },
        },
      },
      {
        node: {
          state: 'UPLOADED',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: ['backend', 'front-end', 'end2end', 'unit', 'worker'],
          downloadUrl: '/test.txt',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
        },
      },
      {
        node: {
          state: 'UPLOADED',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: ['backend', 'front-end'],
          downloadUrl: '/test.txt',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
        },
      },
      {
        node: {
          state: 'UPLOADED',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: ['backend', 'front-end'],
          downloadUrl: '/test.txt',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
        },
      },
      {
        node: {
          state: 'ERROR',
          provider: 'github actions',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          downloadUrl: '/test.txt',
          ciUrl: 'https://example.com',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
          errors: {
            edges: [
              {
                node: {
                  errorCode: 'FILE_NOT_IN_STORAGE',
                },
              },
              {
                node: {
                  errorCode: 'REPORT_EXPIRED',
                },
              },
              {
                node: {
                  errorCode: 'REPORT_EMPTY',
                },
              },
            ],
          },
        },
      },
      {
        node: {
          state: 'PROCESSED',
          provider: 'github actions',
          createdAt: '2020-08-25T16:36:25.820340+00:00',
          updatedAt: '2020-08-25T16:36:25.859889+00:00',
          flags: ['front-end'],
          uploadType: 'CARRYFORWARDED',
          jobCode: '1234',
        },
      },
    ],
  },
  message: 'paths test',
  ciPassed: true,
  compareWithParent: {
    state: 'pending',
  },
  parent: {
    commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
    totals: {
      coverage: 38.30846,
    },
  },
}

const commitDataEmpty = {
  totals: {
    coverage: 38.30846,
    diff: {
      coverage: null,
    },
  },
  commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
  pullId: 10,
  createdAt: '2020-08-25T16:35:32',
  author: {
    username: 'febg',
  },
  state: 'ERROR',
  uploads: {
    edges: [],
  },
  message: 'paths test',
  ciPassed: true,
  compareWithParent: {
    state: 'pending',
  },
  parent: {
    commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
    totals: {
      coverage: 38.30846,
    },
  },
}

const myExampleData = {
  owner: {
    repository: {
      commit: {
        totals: { coverage: 99.53 },
        state: 'complete',
        commitid: '64caa0cdbcce06af3af69299ae5af2f3e0a3245a',
        pullId: null,
        createdAt: '2022-02-23T02:07:02',
        author: { username: 'adrian-codecov' },
        uploads: {
          edges: [
            {
              node: {
                state: 'PROCESSED',
                provider: 'circleci',
                createdAt: '2022-02-23T02:19:32.469473+00:00',
                updatedAt: '2022-02-23T02:19:32.964842+00:00',
                flags: [],
                jobCode: '2',
                downloadUrl:
                  '/upload/gh/codecov/gazebo/download?path=v4/raw/2022-02-23/91DC663110CD105B1FB05FA7F5636233/64caa0cdbcce06af3af69299ae5af2f3e0a3245a/f110ae78-f68d-49f1-9375-b58b5223b9a0.txt',
                ciUrl:
                  'https://circleci.com/gh/codecov/gazebo/17797#tests/containers/2',
                uploadType: 'UPLOADED',
                buildCode: '17797',
              },
            },
            {
              node: {
                state: 'PROCESSED',
                provider: 'circleci',
                createdAt: '2022-02-23T02:19:32.472375+00:00',
                updatedAt: '2022-02-23T02:19:33.474310+00:00',
                flags: [],
                jobCode: '0',
                downloadUrl:
                  '/upload/gh/codecov/gazebo/download?path=v4/raw/2022-02-23/91DC663110CD105B1FB05FA7F5636233/64caa0cdbcce06af3af69299ae5af2f3e0a3245a/3c720890-e102-4090-8154-cc520ae2b974.txt',
                ciUrl:
                  'https://circleci.com/gh/codecov/gazebo/17797#tests/containers/0',
                uploadType: 'UPLOADED',
                buildCode: '17797',
              },
            },
            {
              node: {
                state: 'PROCESSED',
                provider: 'circleci',
                createdAt: '2022-02-23T02:19:43.780176+00:00',
                updatedAt: '2022-02-23T02:19:44.584505+00:00',
                flags: [],
                jobCode: '1',
                downloadUrl:
                  '/upload/gh/codecov/gazebo/download?path=v4/raw/2022-02-23/91DC663110CD105B1FB05FA7F5636233/64caa0cdbcce06af3af69299ae5af2f3e0a3245a/681f2cc6-ab56-4f17-a2fb-813f84a6c108.txt',
                ciUrl:
                  'https://circleci.com/gh/codecov/gazebo/17797#tests/containers/1',
                uploadType: 'UPLOADED',
                buildCode: '17797',
              },
            },
          ],
        },
        message: 'See if lint works',
        ciPassed: true,
        parent: {
          commitid: '9c3cd20f2e790b0d334d3c2afe411367a561924c',
          totals: { coverage: 99.6 },
        },
        compareWithParent: {
          state: 'processed',
          patchTotals: { coverage: 0.84615386 },
          impactedFiles: [
            {
              patchCoverage: { coverage: 100.0 },
              headName: 'src/services/navigation/useNavLinks.js',
              baseCoverage: { coverage: 100.0 },
              headCoverage: { coverage: 100.0 },
            },
            {
              patchCoverage: { coverage: 100.0 },
              headName: 'src/App.js',
              baseCoverage: { coverage: 100.0 },
              headCoverage: { coverage: 100.0 },
            },
            {
              patchCoverage: { coverage: 100.0 },
              headName: 'src/shared/utils/url.js',
              baseCoverage: null,
              headCoverage: { coverage: 100.0 },
            },
            {
              patchCoverage: { coverage: 66.66666666666667 },
              headName: 'src/services/tracking/utm.js',
              baseCoverage: null,
              headCoverage: { coverage: 66.66666666666667 },
            },
          ],
        },
      },
    },
  },
}
