import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { eventTracker } from 'services/events/events'
import Api from 'shared/api'
import { NetworkErrorObject, Provider } from 'shared/api/helpers'

export const TypeProjectsSchema = z.array(
  z.union([
    z.literal('PERSONAL'),
    z.literal('YOUR_ORG'),
    z.literal('OPEN_SOURCE'),
    z.literal('EDUCATIONAL'),
  ])
)

export const GoalsSchema = z.array(
  z.union([
    z.literal('STARTING_WITH_TESTS'),
    z.literal('IMPROVE_COVERAGE'),
    z.literal('MAINTAIN_COVERAGE'),
    z.literal('TEAM_REQUIREMENTS'),
    z.literal('OTHER'),
  ])
)

const MeSchema = z.object({
  owner: z.object({
    defaultOrgUsername: z.string().nullable(),
  }),
  email: z.string().nullable(),
  privateAccess: z.boolean().nullable(),
  onboardingCompleted: z.boolean(),
  businessEmail: z.string().nullable(),
  termsAgreement: z.boolean().nullable(),
  user: z.object({
    name: z.string().nullable(),
    username: z.string(),
    avatarUrl: z.string(),
    avatar: z.string(),
    student: z.boolean(),
    studentCreatedAt: z.string().nullable(),
    studentUpdatedAt: z.string().nullable(),
  }),
  trackingMetadata: z.object({
    service: z.string(),
    ownerid: z.number(),
    serviceId: z.string(),
    plan: z.string().nullable(),
    staff: z.boolean().nullable(),
    hasYaml: z.boolean(),
    bot: z.string().nullable(),
    delinquent: z.boolean().nullable(),
    didTrial: z.boolean().nullable(),
    planProvider: z.string().nullable(),
    planUserCount: z.number().nullable(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    profile: z
      .object({
        createdAt: z.string(),
        otherGoal: z.string().nullable(),
        typeProjects: TypeProjectsSchema,
        goals: GoalsSchema,
      })
      .nullable(),
  }),
})

export type Me = z.infer<typeof MeSchema>

const UserSchema = z.object({
  me: MeSchema.nullable(),
})

export type User = z.infer<typeof UserSchema>

const currentUserFragment = `
fragment CurrentUserFragment on Me {
  owner {
    defaultOrgUsername
  }
  email
  privateAccess
  onboardingCompleted
  businessEmail
  termsAgreement
  user {
    name
    username
    avatarUrl
    avatar: avatarUrl
    student
    studentCreatedAt
    studentUpdatedAt
  }
  trackingMetadata {
    service
    ownerid
    serviceId
    plan
    staff
    hasYaml
    bot
    delinquent
    didTrial
    planProvider
    planUserCount
    createdAt: createstamp
    updatedAt: updatestamp
    profile {
      createdAt
      otherGoal
      typeProjects
      goals
    }
  }
}
`

interface URLParams {
  provider: Provider
}

interface UseUserArgs {
  options?: {
    suspense?: boolean
    enabled?: boolean
    onSuccess?: (user: Me) => void
  }
}

export function useUser({ options }: UseUserArgs = {}) {
  const { provider } = useParams<URLParams>()
  const query = `
    query CurrentUser {
      me {
        ...CurrentUserFragment
      }
    }
    ${currentUserFragment}
  `

  return useQuery({
    queryKey: ['currentUser', provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({ provider, query, signal }).then((res) => {
        const parsedRes = UserSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useUser - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        if (parsedRes.data.me?.trackingMetadata.ownerid) {
          eventTracker().identify({
            userOwnerId: parsedRes.data.me.trackingMetadata.ownerid,
            provider,
          })
        }

        return parsedRes.data.me
      }),
    enabled: provider !== undefined,
    ...options,
  })
}
