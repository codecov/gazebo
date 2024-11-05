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
    mutationFn: (input?: { formData?: unknown; selectedOrg?: string }) => {
      const formData = input?.formData
      const selectedOrg = input?.selectedOrg

      return Api.graphqlMutation({
        provider,
        query: mutation,
        mutationPath: 'onboardUser',
        variables: {
          input: formData,
        },
      }).then((res) => ({
        user: res?.data?.onboardUser?.me,
        selectedOrg: selectedOrg,
      }))
    },
    onSuccess: (data) => {
      const user = data?.user
      queryClient.setQueryData(['currentUser', provider], () => user)

      if (user && typeof opts?.onSuccess === 'function') {
        opts.onSuccess(data, opts?.data)
      }
    },
  })
}
