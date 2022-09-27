import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

export function useMyContexts() {
  const { provider } = useParams()
  const query = `
      query MyContext {
        me {
          owner {
            username
            avatarUrl
          }
          myOrganizations {
            edges {
              node {
                username
                avatarUrl
              }
            }
          }
        }
      }
    `

  return useQuery(['myContexts', provider], () =>
    Api.graphql({ provider, query }).then((res) => {
      const me = res?.data?.me
      return me
        ? {
            currentUser: me.owner,
            myOrganizations: mapEdges(me.myOrganizations),
          }
        : null
    })
  )
}
