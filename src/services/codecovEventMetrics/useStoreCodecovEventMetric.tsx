import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

const mutationQuery = `
  mutation storeEventMetric(
    $input: StoreEventMetricsInput!
  ) {
    storeEventMetric(
      input: $input
    ) {
      error {
        ... on UnauthenticatedError {
          message
        }
        ... on ValidationError {
          message
        }
      }
    }
  }
`

interface Params {
  provider: string
}

interface StoreEventMetricMutationArgs {
  owner: string
  event: string
  jsonPayload: object
}

const LOCAL_STORAGE_KEY = 'UserOnboardingMetricsStored'
const MAX_ENTRIES = 50

const generateMetricString = (
  owner: string,
  event: string,
  jsonPayload: string
) => {
  return `${owner}|${event}|${jsonPayload}`
}

const getStoredMetrics = (): string[] => {
  const storedMetrics = localStorage.getItem(LOCAL_STORAGE_KEY)
  return storedMetrics ? JSON.parse(storedMetrics) : []
}

const isMetricInLocalStorage = (metricString: string) => {
  const storedMetrics = getStoredMetrics()
  return storedMetrics.includes(metricString)
}

const addMetricToLocalStorage = (metricString: string) => {
  let storedMetrics = getStoredMetrics()

  // limit size of metrics stored to ensure we are in reasonable localstorage limits
  if (storedMetrics.length >= MAX_ENTRIES) {
    storedMetrics = storedMetrics.slice(1)
  }

  storedMetrics.push(metricString)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedMetrics))
}

export const useStoreCodecovEventMetric = () => {
  const { provider } = useParams<Params>()

  const mutation = useMutation({
    mutationFn: async ({
      owner,
      event,
      jsonPayload,
    }: StoreEventMetricMutationArgs) => {
      const jsonPayloadString = JSON.stringify(jsonPayload)
      const metricString = generateMetricString(owner, event, jsonPayloadString)
      if (isMetricInLocalStorage(metricString)) {
        return
      }

      const variables = {
        input: {
          orgUsername: owner,
          eventName: event,
          jsonPayload: jsonPayloadString,
        },
      }

      addMetricToLocalStorage(metricString)

      return Api.graphqlMutation({
        provider,
        query: mutationQuery,
        variables,
        mutationPath: 'storeEventMetric',
      })
    },
  })

  return mutation
}
