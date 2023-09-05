import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

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

export function useUser(options = {}) {
  const { provider } = useParams()

  const query = `
    query CurrentUser {
      me {
        ...CurrentUserFragment
      }
    }
    ${currentUserFragment}
  `

  return useQuery({
    queryKey: ['currentUser', provider],
    queryFn: async ({ signal }) => {
      try {
        const { data } = await Api.graphql({ provider, query, signal })
        const currentUser = data?.me

        if (currentUser) return currentUser
        throw new Error('Unauthenticated')
      } catch (e) {
        console.error(`Error at useUser: ${e.message}`)
        return null
      }
    },
    enabled: provider !== undefined,
    ...options,
  })
}
