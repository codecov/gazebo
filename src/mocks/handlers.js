import { graphql } from 'msw'

import { randomAccountDetailsHandler } from 'services/account/mocks'
import { repoCoverageHandler } from 'services/charts/mocks'
import { commitErrored } from 'services/commit/mocks'
import {
  backfillFlagMembershipsHandler,
  flagMeasurementsHandler,
  flagsSelectHandler,
} from 'services/repo/mocks'
import { randomUsersHandler } from 'services/users/mocks'

export const handlers = [
  repoCoverageHandler,
  randomAccountDetailsHandler,
  randomUsersHandler,
  commitErrored,
  flagsSelectHandler,
  flagMeasurementsHandler,
  backfillFlagMembershipsHandler,
]

// pr page that never is left hanging in a "no files covered" when its stuck in a pending state
graphql.query('CurrentUser', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      me: {
        owner: { defaultOrgUsername: null },
        email: 'terry@codecov.io',
        privateAccess: true,
        onboardingCompleted: true,
        businessEmail: '',
        user: {
          name: 'Terry',
          username: 'terry-codecov',
          avatarUrl:
            'https://avatars0.githubusercontent.com/u/87824812?v=3&s=55',
          avatar: 'https://avatars0.githubusercontent.com/u/87824812?v=3&s=55',
          student: false,
          studentCreatedAt: null,
          studentUpdatedAt: null,
        },
        trackingMetadata: {
          service: 'github',
          ownerid: 3456556,
          serviceId: '87824812',
          plan: 'users-basic',
          staff: true,
          hasYaml: false,
          bot: null,
          delinquent: null,
          didTrial: null,
          planProvider: null,
          planUserCount: 5,
          createdAt: null,
          updatedAt: '2023-04-21T15:21:14.161033',
          profile: {
            createdAt: '2021-11-01T19:44:10.795533+00:00',
            otherGoal: '',
            typeProjects: ['YOUR_ORG'],
            goals: ['IMPROVE_COVERAGE'],
          },
        },
      },
    })
  )
})

graphql.query('DetailOwner', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        orgUploadToken: '9a9f1bb6-43e9-4766-b48b-aa16b449fbb1',
        ownerid: 5537,
        username: 'codecov',
        avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
        isCurrentUserPartOfOrg: true,
        isAdmin: true,
      },
    })
  )
})

graphql.query('DetailOwner2', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        orgUploadToken: '9a9f1bb6-43e9-4766-b48b-aa16b449fbb1',
        ownerid: 5537,
        username: 'codecov',
        avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
        isCurrentUserPartOfOrg: true,
        isAdmin: true,
      },
    })
  )
})

graphql.query('PullPageData', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        isCurrentUserPartOfOrg: true,
        repository: {
          private: true,
          pull: {
            pullId: 1506,
            head: { commitid: '04362ea9b08bcc61e3542c6a51eb65d586956bcc' },
            compareWithBase: {
              impactedFilesCount: 0,
              indirectChangedFilesCount: 0,
              directChangedFilesCount: 0,
              flagComparisonsCount: 0,
              componentComparisonsCount: 0,
              __typename: 'Comparison',
            },
          },
        },
      },
    })
  )
})

graphql.PullHeadData('PullHeadData', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        repository: {
          pull: {
            pullId: 1506,
            title: 'Remove unused resolvers and mutations',
            state: 'OPEN',
            author: { username: 'scott-codecov' },
            head: { branchName: 'scott/cleanup', ciPassed: true },
            updatestamp: '2023-04-25T15:38:48.046832',
          },
        },
      },
    })
  )
})

graphql.query('Pull', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        isCurrentUserPartOfOrg: true,
        repository: {
          defaultBranch: 'master',
          private: true,
          pull: {
            commits: { edges: [] },
            compareWithBase: {
              __typename: 'Comparison',
              flagComparisons: [],
              patchTotals: null,
              baseTotals: { percentCovered: 94.79 },
              headTotals: { percentCovered: 94.97 },
              impactedFiles: [],
              changeCoverage: 0.18,
              hasDifferentNumberOfHeadAndBaseReports: false,
            },
            pullId: 1506,
            title: 'Remove unused resolvers and mutations',
            state: 'OPEN',
            author: { username: 'scott-codecov' },
            head: {
              ciPassed: true,
              branchName: 'scott/cleanup',
              state: 'complete',
              commitid: '04362ea9b08bcc61e3542c6a51eb65d586956bcc',
              totals: { percentCovered: 94.97 },
              uploads: { totalCount: 1 },
            },
            updatestamp: '2023-04-25T15:38:48.046832',
            behindBy: null,
            behindByCommit: null,
            comparedTo: {
              commitid: '7f548fb6b2efab479ac0d74f097d939bd4bdb368',
              uploads: { totalCount: 1 },
            },
          },
        },
      },
    })
  )
})

graphql.query('Pull2', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        isCurrentUserPartOfOrg: true,
        repository: {
          defaultBranch: 'master',
          private: true,
          pull: {
            commits: { edges: [] },
            compareWithBase: {
              __typename: 'Comparison',
              flagComparisons: [],
              patchTotals: null,
              baseTotals: { percentCovered: 94.79 },
              headTotals: { percentCovered: 94.97 },
              impactedFiles: [],
              changeCoverage: 0.18,
              hasDifferentNumberOfHeadAndBaseReports: false,
            },
            pullId: 1506,
            title: 'Remove unused resolvers and mutations',
            state: 'OPEN',
            author: { username: 'scott-codecov' },
            head: {
              ciPassed: true,
              branchName: 'scott/cleanup',
              state: 'complete',
              commitid: '04362ea9b08bcc61e3542c6a51eb65d586956bcc',
              totals: { percentCovered: 94.97 },
              uploads: { totalCount: 1 },
            },
            updatestamp: '2023-04-25T15:38:48.046832',
            behindBy: null,
            behindByCommit: null,
            comparedTo: {
              commitid: '7f548fb6b2efab479ac0d74f097d939bd4bdb368',
              uploads: { totalCount: 1 },
            },
          },
        },
      },
    })
  )
})

graphql.query('GetCommits', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.data({
      owner: {
        repository: {
          commits: {
            totalCount: 0,
            edges: [],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      },
    })
  )
})

graphql.query('CurrentUser', (req, res, ctx) => {
  return res(ctx.status(200), ctx.data())
})
