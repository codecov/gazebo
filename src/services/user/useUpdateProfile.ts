import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import config from 'config'

import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'

const CurrentUserFragment = z.object({
  email: z.string(),
  privateAccess: z.boolean(),
  onboardingCompleted: z.boolean(),
  businessEmail: z.string(),
  user: z.object({
    name: z.string(),
    username: z.string(),
    avatarUrl: z.string(),
    avatar: z.string(),
    student: z.boolean(),
    studentCreatedAt: z.string(),
    studentUpdatedAt: z.string(),
  }),
  trackingMetadata: z.object({
    service: z.string(),
    ownerid: z.string(),
    serviceId: z.string(),
  }),
})

const CurrentUserFragmentSchema = z.object({
  me: CurrentUserFragment.nullable(),
  error: z
    .discriminatedUnion('__typename', [
      z.object({
        __typename: z.literal('ValidationError'),
      }),
    ])
    .nullable(),
})

const currentUserFragment = `
fragment CurrentUserFragment on Me {
  email
  privateAccess
  onboardingCompleted
  businessEmail
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
    service
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

export function useUpdateProfile({ provider }: { provider: string }) {
  const queryClient = useQueryClient()
  const mutation = `
    mutation UpdateProfile($input: UpdateProfileInput!) {
      updateProfile(input: $input) {
        me {
          ...CurrentUserFragment
        }
        error {
          __typename
        }
      }
    }
    ${currentUserFragment}
  `

  return useMutation({
    mutationFn: ({ name, email }: { name: string; email: string }) => {
      return Api.graphqlMutation({
        provider,
        query: mutation,
        mutationPath: 'updateProfile',
        variables: {
          input: {
            name,
            email,
          },
        },
      })
    },
    onSuccess: ({ data }) => {
      const parsedData = CurrentUserFragmentSchema.safeParse(data)
      if (!parsedData.success) {
        return rejectNetworkError({
          status: 404,
          data: {},
          dev: 'useUpdateProfile - 404 failed to parse',
        } satisfies NetworkErrorObject)
      }

      queryClient.setQueryData(['currentUser', provider], () => user)

      if (config.IS_SELF_HOSTED) {
        queryClient.invalidateQueries(['SelfHostedCurrentUser'])
      }
    },
  })
}
