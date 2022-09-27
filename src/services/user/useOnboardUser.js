import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

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
    cannySSOToken
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

export function useOnboardUser(opts) {
  const { provider } = useParams()
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

  return useMutation(
    (input) => {
      return Api.graphqlMutation({
        provider,
        query: mutation,
        mutationPath: 'onboardUser',
        variables: {
          input,
        },
      }).then((res) => res?.data?.onboardUser?.me)
    },
    {
      onSuccess: (user) => {
        queryClient.setQueryData(['currentUser', provider], () => user)

        if (user && typeof opts?.onSuccess === 'function') {
          opts.onSuccess(user, opts?.data)
        }
      },
    }
  )
}
