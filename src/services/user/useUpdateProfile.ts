import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import config from 'config'

import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'

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
