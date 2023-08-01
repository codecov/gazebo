import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Redirect, useHistory, useParams } from 'react-router-dom'
import { z } from 'zod'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'
import { mapEdges } from 'shared/utils/graphql'
import Avatar from 'ui/Avatar/Avatar'
import Button from 'ui/Button'
import Select from 'ui/Select'

import GitHubHelpBanner from './GitHubHelpBanner'

import { useMyOrganizations } from '../TermsOfService/hooks/useMyOrganizations'

const FormSchema = z.object({
  select: z.string().nullish(),
})

const renderItem = ({ item }) => {
  if (!item) return null

  return (
    <div className="flex h-8 items-center gap-2">
      {item?.avatarUrl && <Avatar user={item} />}
      <span>{item?.username}</span>
    </div>
  )
}

function DefaultOrgSelector() {
  const { register, control, setValue, handleSubmit } = useForm({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
  })

  const { provider } = useParams()
  const history = useHistory()

  const { data: currentUser, isLoading: userIsLoading } = useUser()
  const { mutate: updateDefaultOrg } = useUpdateDefaultOrganization()

  const {
    data: myOrganizations,
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = useMyOrganizations({
    select: ({ pages }) => {
      const [organizations] = pages.map((org) =>
        mapEdges(org?.me?.myOrganizations)
      )
      return organizations
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
                items={myOrganizations || []}
                renderItem={(item) => renderItem({ item })}
                onChange={(value) =>
                  setValue('select', value?.username, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onLoadMore={() => hasNextPage && fetchNextPage()}
                isLoading={isFetching}
                ariaName="Select an organization"
                dataMarketing="Select an organization"
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
