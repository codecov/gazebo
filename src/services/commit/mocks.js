import { graphql } from 'msw'

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

export const commitOneCarriedForward = graphql.query(
  'Commit',
  (req, res, ctx) => {
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
                      state: 'COMPLETE',
                      provider: 'travis',
                      createdAt: '2020-08-25T16:36:19.559474+00:00',
                      updatedAt: '2020-08-25T16:36:19.679868+00:00',
                      downloadUrl: '/test.txt',
                      ciUrl: 'https://example.com',
                      uploadType: 'CARRYFORWARDED',
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
  }
)

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
          uploadType: 'UPLOADED',
          jobCode: '1234',
        },
      },
      {
        node: {
          state: 'COMPLETE',
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
