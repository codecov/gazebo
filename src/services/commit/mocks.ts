import { graphql, HttpResponse } from 'msw2'

export const commitErrored = graphql.query('Commit', (info) => {
  return HttpResponse.json({
    data: {
      owner: {
        repository: {
          __typename: 'Repository',
          commit: commitDataError,
        },
      },
    },
  })
})

export const commitOnePending = graphql.query('Commit', (info) => {
  let flags = ['unit']
  let provider = 'travis'
  if (info.variables.isTeamPlan) {
    flags = []
    provider = 'travisTeam'
  }

  return HttpResponse.json({
    data: {
      owner: {
        repository: {
          __typename: 'Repository',
          commit: {
            ...commitDataError,
            branchName: null,
            uploads: {
              edges: [
                {
                  node: {
                    id: null,
                    name: null,
                    errors: null,
                    state: 'STARTED',
                    provider,
                    createdAt: '2020-08-25T16:36:19.559474+00:00',
                    updatedAt: '2020-08-25T16:36:19.679868+00:00',
                    downloadUrl: '/test.txt',
                    ciUrl: 'https://example.com',
                    uploadType: 'UPLOADED',
                    jobCode: '1234',
                    buildCode: '1234',
                    flags,
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

export const commitOneCarriedForward = graphql.query('Commit', (info) => {
  return HttpResponse.json({
    data: {
      owner: {
        repository: {
          __typename: 'Repository',
          commit: {
            ...commitDataError,
            uploads: {
              edges: [
                {
                  node: {
                    id: null,
                    name: null,
                    errors: null,
                    state: 'COMPLETE',
                    provider: 'travis',
                    createdAt: '2020-08-25T16:36:19.559474+00:00',
                    updatedAt: '2020-08-25T16:36:19.679868+00:00',
                    downloadUrl: '/test.txt',
                    ciUrl: 'https://example.com',
                    uploadType: 'CARRIEDFORWARD',
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
    },
  })
})

export const commitEmptyUploads = graphql.query('Commit', (info) => {
  return HttpResponse.json({
    data: {
      owner: {
        repository: {
          __typename: 'Repository',
          commit: commitDataEmpty,
        },
      },
    },
  })
})

export const compareTotalsEmpty = graphql.query('CompareTotals', (info) => {
  return HttpResponse.json({ data: { owner: null } })
})

const commitDataError = {
  totals: {
    coverage: 38.30846,
    diff: {
      coverage: null,
    },
  },
  branchName: null,
  id: null,
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
          id: null,
          name: null,
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
          id: null,
          name: null,
          state: 'STARTED',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: ['backend', 'front-end', 'end2end', 'unit', 'worker'],
          downloadUrl: '/test.txt',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
          ciUrl: null,
          errors: null,
        },
      },
      {
        node: {
          id: null,
          name: null,
          state: 'STARTED',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: ['backend', 'front-end'],
          downloadUrl: '/test.txt',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
          ciUrl: null,
          errors: null,
        },
      },
      {
        node: {
          id: null,
          name: null,
          state: 'STARTED',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: ['backend', 'front-end'],
          downloadUrl: '/test.txt',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
          ciUrl: null,
          errors: null,
        },
      },
      {
        node: {
          id: null,
          name: null,
          state: 'ERROR',
          provider: 'github actions',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          downloadUrl: '/test.txt',
          ciUrl: 'https://example.com',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          buildCode: '1234',
          flags: [],
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
          id: null,
          name: null,
          state: 'PROCESSED',
          provider: 'github actions',
          createdAt: '2020-08-25T16:36:25.820340+00:00',
          updatedAt: '2020-08-25T16:36:25.859889+00:00',
          flags: ['front-end'],
          downloadUrl: '/test.txt',
          uploadType: 'UPLOADED',
          jobCode: '1234',
          ciUrl: null,
          errors: null,
          buildCode: null,
        },
      },
      {
        node: {
          id: null,
          name: null,
          state: 'COMPLETE',
          provider: 'github actions',
          createdAt: '2020-08-25T16:36:25.820340+00:00',
          updatedAt: '2020-08-25T16:36:25.859889+00:00',
          downloadUrl: '/test.txt',
          flags: ['front-end'],
          uploadType: 'CARRIEDFORWARD',
          jobCode: '1234',
          ciUrl: null,
          errors: null,
          buildCode: null,
        },
      },
    ],
  },
  message: 'paths test',
  ciPassed: true,
  compareWithParent: {
    __typename: 'Comparison',
    state: 'pending',
    indirectChangedFilesCount: 1,
    directChangedFilesCount: 1,
    patchTotals: null,
    impactedFiles: {
      __typename: 'ImpactedFiles',
      results: [],
    },
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
    __typename: 'Comparison',
    state: 'pending',
  },
  parent: {
    commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
    totals: {
      coverage: 38.30846,
    },
  },
}
