import { useQuery } from '@tanstack/react-query'
import isUndefined from 'lodash/isUndefined'
import { useHistory, useLocation } from 'react-router-dom'
import { z } from 'zod'

import config from 'config'

import Api from 'shared/api'

const EnterpriseUserSchema = z
  .object({
    me: z
      .object({
        email: z.string().nullish(),
      })
      .nullish(),
  })
  .nullish()

export const useEnterpriseRedirect = () => {
  const history = useHistory()
  const location = useLocation()
  const provider = config?.ENTERPRISE_DEFAULT_PROVIDER

  const { data } = useQuery({
    queryKey: ['EnterpriseLandingPageUser', provider],
    queryFn: ({ signal }) => {
      const query = `
        query EnterpriseLandingPageUser {
          me {
            email
          }
        }
      `

      return Api.graphql({
        query,
        provider,
        signal,
      }).then((res) => {
        const data = res?.data

        return EnterpriseUserSchema.parse(data)
      })
    },
    enabled: !!provider,
  })

  // if the user is found we should redirect
  if (
    !isUndefined(data?.me?.email) &&
    !isUndefined(provider) &&
    location.pathname !== `/${provider}`
  ) {
    history.replace(provider)
    return
  }

  return
}
