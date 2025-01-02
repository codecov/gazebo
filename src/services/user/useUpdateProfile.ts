import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import config from 'config'

import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'

const TypeProjectsSchema = z.array(
  z.union([
    z.literal('PERSONAL'),
    z.literal('YOUR_ORG'),
    z.literal('OPEN_SOURCE'),
    z.literal('EDUCATIONAL'),
  ])
)

const GoalsSchema = z.array(
  z.union([
    z.literal('STARTING_WITH_TESTS'),
    z.literal('IMPROVE_COVERAGE'),
    z.literal('MAINTAIN_COVERAGE'),
    z.literal('TEAM_REQUIREMENTS'),
    z.literal('OTHER'),
  ])
)

const CurrentUserFragment = z.object({
  email: z.string().nullish(),
  privateAccess: z.boolean().nullish(),
  onboardingCompleted: z.boolean().nullish(),
  businessEmail: z.string().nullish(),
  user: z
    .object({
      name: z.string().nullish(),
      username: z.string().nullish(),
      avatarUrl: z.string().nullish(),
      avatar: z.string().nullish(),
      student: z.boolean().nullish(),
      studentCreatedAt: z.string().nullish(),
      studentUpdatedAt: z.string().nullish(),
    })
    .nullish(),
  trackingMetadata: z
    .object({
      service: z.string().nullish(),
      ownerid: z.number().nullish(),
      serviceId: z.string().nullish(),
      plan: z.string().nullish(),
      staff: z.boolean().nullish(),
      hasYaml: z.boolean(),
      bot: z.string().nullish(),
      delinquent: z.boolean().nullish(),
      didTrial: z.boolean().nullish(),
      planProvider: z.string().nullish(),
      planUserCount: z.number().nullish(),
      createdAt: z.string().nullish(),
      updatedAt: z.string().nullish(),
      profile: z
        .object({
          createdAt: z.string().nullish(),
          otherGoal: z.string().nullish(),
          typeProjects: TypeProjectsSchema.nullish(),
          goals: GoalsSchema.nullish(),
        })
        .nullish(),
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
      })
    },
    onSuccess: ({ data }) => {
      const parsedData = UpdateProfileResponseSchema.safeParse(data)
      if (!parsedData.success) {
        return rejectNetworkError({
          status: 404,
          data: {},
          dev: 'useUpdateProfile - 404 failed to parse',
        } satisfies NetworkErrorObject)
      }

      queryClient.setQueryData(
        ['currentUser', provider],
        () => parsedData.data.updateProfile?.me
      )

      if (config.IS_SELF_HOSTED) {
        queryClient.invalidateQueries(['SelfHostedCurrentUser'])
      }
    },
  })
}
