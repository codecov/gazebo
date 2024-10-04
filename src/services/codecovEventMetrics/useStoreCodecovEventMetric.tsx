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
// Maintain parity with list of allowed metrics here
// https://github.com/codecov/shared/blob/main/shared/django_apps/codecov_metrics/service/codecov_metrics.py
export const EVENT_METRICS = {
  VISITED_PAGE: 'VISITED_PAGE',
  CLICKED_BUTTON: 'CLICKED_BUTTON',
  COPIED_TEXT: 'COPIED_TEXT',
  COMPLETED_UPLOAD: 'COMPLETED_UPLOAD',
  INSTALLED_APP: 'INSTALLED_APP',
} as const

type EventMetric = (typeof EVENT_METRICS)[keyof typeof EVENT_METRICS]

interface Params {
  provider: string
}

interface StoreEventMetricMutationArgs {
  owner: string
  event: EventMetric
  jsonPayload: object
}

const LOCAL_STORAGE_KEY = 'UserOnboardingMetricsStored'
const MAX_ENTRIES = 30

const generateMetricString = (
  owner: string,
  event: EventMetric,
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
