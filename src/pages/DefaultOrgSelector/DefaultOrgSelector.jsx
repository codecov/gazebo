import { zodResolver } from '@hookform/resolvers/zod'
import { useLayoutEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Redirect, useHistory, useParams } from 'react-router-dom'
import { z } from 'zod'

import config from 'config'

import { SentryBugReporter } from 'sentry'

import { TrialStatuses, usePlanData } from 'services/account'
import {
  EVENT_METRICS,
  useStoreCodecovEventMetric,
} from 'services/codecovEventMetrics'
import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { useStaticNavLinks } from 'services/navigation'
import { useStartTrial } from 'services/trial'
import { CustomerIntent, useUser } from 'services/user'
import { isBasicPlan } from 'shared/utils/billing'
import { mapEdges } from 'shared/utils/graphql'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A/A'
import Avatar from 'ui/Avatar/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon/Icon'
import Select from 'ui/Select'

import GitHubHelpBanner from './GitHubHelpBanner'
import { useMyOrganizations } from './hooks/useMyOrganizations'

const FormSchema = z.object({
  select: z.string().nullish(),
})

const renderItem = ({ item }) => {
  if (!item) return null

  if (item?.isDisabled) {
    return (
      <div className="flex h-8 items-center gap-2 text-ds-gray-quaternary">
        No organizations found
      </div>
    )
  }

  if (item?.isProvider) {
    return (
      <div className="flex h-8 items-center gap-2">
        <A to={{ pageName: 'codecovAppInstallation' }}>
          <Icon name="plus-circle" />
          <span>Install Codecov GitHub app</span>
        </A>
      </div>
    )
  }

  return (
    <div className="flex h-8 items-center gap-2">
      {item?.org?.avatarUrl && <Avatar user={item?.org} />}
      <span>{item?.org?.username}</span>
    </div>
  )
}

function DefaultOrgSelector() {
  const { register, control, setValue, handleSubmit } = useForm({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
  })

  const { provider } = useParams()
  const isGh = providerToName(provider) === 'GitHub'

  const history = useHistory()

  const [orgValue, setOrgValue] = useState(null)
  const { codecovAppInstallation } = useStaticNavLinks()

  const { data: currentUser, isLoading: userIsLoading } = useUser()
  const { mutate: updateDefaultOrg } = useUpdateDefaultOrganization()
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()

  const selectedOrg = orgValue?.org?.username ?? currentUser?.user?.username

  const { data: planData } = usePlanData({
    owner: selectedOrg,
    provider,
  })
  const { mutate: fireTrial } = useStartTrial()

  const isNewTrial = planData?.plan?.trialStatus === TrialStatuses.NOT_STARTED
  const {
    data: myOrganizations,
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = useMyOrganizations({
    select: ({ pages }) => {
      const organizations = pages.flatMap((org) =>
        mapEdges(org?.me?.myOrganizations).map((edge) => ({
          org: edge,
          isProvider: false,
        }))
      )

      return [
        {
          org: pages?.at(-1)?.me?.owner,
          isProvider: false,
        },
        ...organizations,
      ]
    },
  })

  const isBusinessIntent =
    currentUser?.user?.customerIntent === CustomerIntent.BUSINESS

  useLayoutEffect(() => {
    if (!config.SENTRY_DSN) {
      return
    }
    const widget = SentryBugReporter.createWidget()
    return widget.removeFromDom
  }, [])

  const onSubmit = () => {
    updateDefaultOrg({ username: selectedOrg })
    storeEventMetric({
      owner: selectedOrg,
      event: EVENT_METRICS.CLICKED_BUTTON,
      jsonPayload: { action: 'Selected Default Org' },
    })
    if (
      isBasicPlan(planData?.plan?.value) &&
      selectedOrg !== currentUser?.user?.username &&
      isNewTrial &&
      planData?.hasPrivateRepos
    ) {
      fireTrial({ owner: selectedOrg })
    }

    return history.push(`/${provider}/${selectedOrg}?source=onboarding`)
  }

  if (userIsLoading) return null
  if (!userIsLoading && !currentUser) return <Redirect to="/login" />

  const filteredOrganizations =
    isBusinessIntent &&
    myOrganizations[0]?.org?.username === currentUser?.user?.username
      ? myOrganizations.slice(1)
      : myOrganizations

  return (
    <div className="mx-auto w-full max-w-[38rem]">
      <h1 className="pb-3 pt-20 text-2xl font-semibold">
        Which organization are you working with today?
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-4 flex flex-col gap-4 border-y border-ds-gray-tertiary py-6">
          <Controller
            name="select"
            control={control}
            render={() => (
              <Select
                variant="defaultOrgSelector"
                register={register}
                required
                placeholder="Select organization"
                items={[
                  ...(filteredOrganizations.length > 0
                    ? filteredOrganizations
                    : [{ org: {}, isDisabled: true }]),
                  ...(isGh ? [{ org: {}, isProvider: true }] : []),
                ]}
                renderItem={(item) => renderItem({ item })}
                onChange={(value) => {
                  if (!value?.isProvider) {
                    setOrgValue(value)
                    setValue('select', value?.org?.username, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  } else if (value?.isProvider) {
                    window.open(codecovAppInstallation.path(), '_blank')
                  }
                }}
                onLoadMore={() => hasNextPage && fetchNextPage()}
                isLoading={isFetching}
                ariaName="Select an organization"
                dataMarketing="Select an organization"
                value={orgValue}
              />
            )}
          />
          <GitHubHelpBanner />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            to={{ pageName: 'login' }}
            variant="plain"
            disabled={false}
            hook="org-select-cancel-button"
          >
            Cancel
          </Button>
          <Button hook="user selects org, continues to app" type="submit">
            Continue to Codecov
          </Button>
        </div>
      </form>
    </div>
  )
}

export default DefaultOrgSelector
