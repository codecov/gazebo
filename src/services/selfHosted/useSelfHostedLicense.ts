import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const SelfHostedLicenseSchema = z
  .object({
    config: z
      .object({
        selfHostedLicense: z
          .object({
            expirationDate: z.string(),
          })
          .nullable(),
      })
      .nullable(),
  })
  .nullable()

export interface UseTierArgs {
  provider: string
}

const query = `
  query SelfHostedLicense {
    config {
      selfHostedLicense {
        expirationDate
      }
    }
  }
`

export const useSelfHostedLicense = ({ provider }: UseTierArgs) =>
  useQuery({
    queryKey: ['SelfHostedLicense', provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
      }).then((res) => {
        const parsedRes = SelfHostedLicenseSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        return parsedRes.data?.config?.selfHostedLicense ?? null
      }),
  })
