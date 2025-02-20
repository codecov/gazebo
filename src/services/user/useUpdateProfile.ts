import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import config from 'config'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

import { GoalsSchema, TypeProjectsSchema } from './useUser'

const CurrentUserFragment = z.object({
  email: z.string().nullable(),
  privateAccess: z.boolean().nullable(),
  onboardingCompleted: z.boolean(),
  businessEmail: z.string().nullable(),
  user: z.object({
    name: z.string().nullable(),
    username: z.string(),
    avatarUrl: z.string(),
    avatar: z.string(),
    student: z.boolean(),
    studentCreatedAt: z.string().nullable(),
    studentUpdatedAt: z.string().nullable(),
  }),
  trackingMetadata: z
    .object({
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
    })
    .nullish(),
})

const UpdateProfileResponseSchema = z.object({
  updateProfile: z
    .object({
      me: CurrentUserFragment.nullish(),
      error: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('ValidationError'),
          }),
        ])
        .nullish(),
    })
    .nullish(),
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
      }).then((res) => {
        const parsedData = UpdateProfileResponseSchema.safeParse(res.data)
        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'useUpdateProfile',
              error: parsedData.error,
            },
          })
        }
        return parsedData.data.updateProfile?.me
      })
    },
    onSuccess: (currentUser) => {
      queryClient.setQueryData(['currentUser', provider], () => currentUser)

      if (config.IS_SELF_HOSTED) {
        queryClient.invalidateQueries(['SelfHostedCurrentUser'])
      }
    },
  })
}
