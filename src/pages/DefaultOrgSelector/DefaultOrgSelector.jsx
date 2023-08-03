import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Redirect, useHistory, useParams } from 'react-router-dom'
import { z } from 'zod'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { useStaticNavLinks } from 'services/navigation'
import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'
import { mapEdges } from 'shared/utils/graphql'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A/A'
import Avatar from 'ui/Avatar/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon/Icon'
import Select from 'ui/Select'

import GitHubHelpBanner from './GitHubHelpBanner'

import { useMyOrganizations } from '../TermsOfService/hooks/useMyOrganizations'

const FormSchema = z.object({
  select: z.string().nullish(),
})

const renderItem = ({ item }) => {
  if (!item) return null

  if (item?.isProvider) {
    return (
      <div className="flex h-8 items-center gap-2">
        <A pathname={{ pageName: 'codecovAppInstallation' }}>
          <Icon name="plus-circle" />
          <span>Add GitHub organization</span>
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

// eslint-disable-next-line max-statements
function DefaultOrgSelector() {
  const { register, control, setValue, handleSubmit } = useForm({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
  })

  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  const history = useHistory()

  const [orgValue, setOrgValue] = useState(null)
  const { codecovAppInstallation } = useStaticNavLinks()

  const { data: currentUser, isLoading: userIsLoading } = useUser()
  const { mutate: updateDefaultOrg } = useUpdateDefaultOrganization()

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

  const onSubmit = (data) => {
    if (!data?.select) {
      updateDefaultOrg({ username: currentUser?.user?.username })
      return history.push(`/${provider}/${currentUser?.user?.username}`)
    }

    const segmentEvent = {
      event: 'Onboarding default org selector',
      data: {
        ownerid: currentUser?.trackingMetadata?.ownerid,
        username: currentUser?.user?.username,
        org: data?.select,
      },
    }
    trackSegmentEvent(segmentEvent)

    updateDefaultOrg({ username: data?.select })
    // fire the trial mutation on continue to app
    return history.push(`/${provider}/${data?.select}`)
  }

  if (userIsLoading) return null
  if (!userIsLoading && !currentUser) return <Redirect to="/login" />

  return (
    <div className="mx-auto w-full max-w-[38rem]">
      <h1 className="pb-3 pt-20 text-2xl font-semibold">
        What org would you like to setup?
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
                  ...myOrganizations,
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
        <div className="flex justify-end">
          <Button hook="user selects org, continues to app" type="submit">
            Continue to app
          </Button>
        </div>
      </form>
    </div>
  )
}

export default DefaultOrgSelector
