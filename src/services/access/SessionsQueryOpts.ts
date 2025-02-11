import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import { mapEdges } from 'shared/utils/graphql'

const SessionSchema = z.object({
  sessionid: z.number(),
  ip: z.string().nullable(),
  lastseen: z.string().nullable(),
  useragent: z.string().nullable(),
  type: z.string(),
  name: z.string().nullable(),
  lastFour: z.string(),
})

export type Session = z.infer<typeof SessionSchema>

const UserTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  lastFour: z.string(),
})

export type UserToken = z.infer<typeof UserTokenSchema>

const RequestSchema = z.object({
  me: z
    .object({
      sessions: z.object({
        edges: z.array(
          z.object({
            node: SessionSchema,
          })
        ),
      }),
      tokens: z.object({
        edges: z.array(
          z.object({
            node: UserTokenSchema,
          })
        ),
      }),
    })
    .nullable(),
})

const query = `query MySessions {
  me {
    sessions {
      edges {
        node {
          sessionid
          name
          ip
          lastseen
          useragent
          type
          lastFour
        }
      }
    }
    tokens {
      edges {
        node {
          type
          name
          lastFour
          id
        }
      }
    }
  }
}`

interface SessionsQueryArgs {
  provider: string
}

export function SessionsQueryOpts({ provider }: SessionsQueryArgs) {
  return queryOptionsV5({
    queryKey: ['sessions', provider, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSessions - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        const data = parsedRes.data

        if (!data.me) {
          return null
        }

        return {
          sessions: mapEdges(data.me.sessions),
          tokens: mapEdges(data.me.tokens),
        }
      }),
  })
}
