import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export interface UseAccountDetailsArgs {
  provider: string
  owner: string
  opts?: {
    enabled?: boolean
  }
}

export interface Plan {
  baseUnitPrice: number
  benefits: string[]
  billingRate: null | string
  marketingName: string
  quantity: number
  value: string
}

export interface SubscriptionDetail {
  customer: {
    email: string
    discount: string
  }
}

export interface Organization {
  plan: Plan | null
}

export interface AccountDetails {
  activatedStudentCount: number
  activatedUserCount: number
  checkoutSessionId: null | string
  email: null | string
  inactiveUserCount: number
  integrationId: null | string
  name: string
  nbActivePrivateRepos: number
  plan: Plan
  planAutoActivate: boolean
  planProvider: null | string
  repoTotalCredits: number
  rootOrganization: null | Organization
  scheduleDetail: null | string
  studentCount: number
  subscriptionDetail: null | SubscriptionDetail
  usesInvoice: boolean
}

function getPathAccountDetails({
  provider,
  owner,
}: {
  provider: string
  owner: string
}) {
  return `/${provider}/${owner}/account-details/`
}

function fetchAccountDetails({
  provider,
  owner,
  signal,
}: {
  provider: string
  owner: string
  signal?: AbortSignal
}) {
  const path = getPathAccountDetails({ provider, owner })
  return Api.get({ path, provider, signal })
}

export function useAccountDetails({
  provider,
  owner,
  opts = {},
}: UseAccountDetailsArgs): AccountDetails {
  return useQuery({
    queryKey: ['accountDetails', provider, owner],
    queryFn: ({ signal }) => fetchAccountDetails({ provider, owner, signal }),
    ...opts,
  }).data
}
