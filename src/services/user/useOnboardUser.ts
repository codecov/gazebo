import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import { z } from 'zod'

const TOAST_DURATION = 10000

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

const CurrentUserFragmentSchema = z.object({
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
    plan: z.string(),
    staff: z.boolean(),
    hasYaml: z.boolean(),
    bot: z.boolean(),
    delinquent: z.boolean(),
    didTrial: z.boolean(),
    planProvider: z.string(),
    planUserCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
})

const ResponseSchema = z.object({
  onboardUser: z
    .object({
      error: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('UnauthorizedError'),
          }),
          z.object({
            __typename: z.literal('ValidationError'),
          }),
          z.object({
            __typename: z.literal('UnauthenticatedError'),
          }),
        ])
        .nullable(),
      me: CurrentUserFragmentSchema.nullable(),
    })
    .nullable(),
})


interface URLParams {
  provider: string
}

export function useOnboardUser(opts?: Record<string, unknown>) {
  const { provider } = useParams<URLParams>()
  const queryClient = useQueryClient()
  const mutation = `
      mutation OnboardUser($input: OnboardUserInput!) {
        onboardUser(input: $input) {
          error {
            __typename
          }
          me {
            ...CurrentUserFragment
          }
        }
      }
      ${currentUserFragment}
    `

  return useMutation({
    mutationFn: (input: { formData?: unknown; selectedOrg?: string }) => {
      const { formData, selectedOrg } = input
      return Api.graphqlMutation({
        provider,
        query: mutation,
        mutationPath: 'onboardUser',
        variables: {
          input: formData,
        },
      }).then(result => ({
        ...result,
        selectedOrg
      }))
    },
    onSuccess: (data: { data: any; selectedOrg?: string }) => {
      const parsedData = ResponseSchema.safeParse(data.data)
      if (!parsedData.success) {
        return Promise.reject({
          status: 404,
          data: {},
          dev: 'useOnboardUser - 404 failed to parse',
        } satisfies NetworkErrorObject)
      }

      const error = parsedData.data.onboardUser?.error
      if (error) {
        if (
          error.__typename === 'ValidationError' ||
          error.__typename === 'UnauthorizedError' ||
          error.__typename === 'UnauthenticatedError'
        ) {
          addToast({
            type: 'error',
            text: <SaveOktaConfigMessage />,
            disappearAfter: TOAST_DURATION,
          })
        }
      } else {
        addToast({
          type: 'success',
          text: 'Okta configuration saved successfully!',
          disappearAfter: TOAST_DURATION,
        })
      }

      // .then((res) => ({
      //   user: res?.data?.onboardUser?.me,
      //   selectedOrg: selectedOrg,
      // }))

      const user = data.data?.user
      queryClient.setQueryData(['currentUser', provider], () => user)

      if (user && typeof opts?.onSuccess === 'function') {
        opts.onSuccess(data.data, opts?.data)
      }
    },
  })
}
