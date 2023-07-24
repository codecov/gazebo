import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { z } from 'zod'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { useUser } from 'services/user'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'
import Avatar from 'ui/Avatar/Avatar'
import Button from 'ui/Button'
import Select from 'ui/Select'

import GitHubHelpBanner from './GitHubHelpBanner'

import { useMyOrganizations } from '../TermsOfService/hooks/useMyOrganizations'

const FormSchema = z.object({
  select: z.string().nullish(),
})

function DefaultOrgSelector() {
  const { register, control, formState, setValue, handleSubmit } = useForm({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
  })

  const { data: currentUser, isLoading: userIsLoading } = useUser()
  const { provider } = useParams()
  const history = useHistory()
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

  const renderItem = ({ item }) => {
    if (!item) return null

    return (
      <div className="flex h-8 items-center gap-2">
        {item?.avatarUrl && <Avatar user={item} />}
        <span>{item?.username}</span>
      </div>
    )
  }

  const onSubmit = (data) => {
    if (!data?.select)
      return history.push(`/${provider}/${currentUser?.user?.username}`)

    updateDefaultOrg({ username: data?.select }) //got an embed redirect that's removed in #pr-2134
    // fire the trial mutation on continue to app
    return history.push(`/${provider}/${data?.select}`)
  }

  if (userIsLoading) return null

  return (
    <div className="mx-auto w-full max-w-[38rem]">
      <h1 className="pb-3 pt-20 text-2xl font-semibold">
        What org would you like to setup?
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-4 flex flex-col gap-4 border-y border-ds-gray-tertiary py-6">
          <div className="">
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
                  onChange={
                    (value) =>
                      setValue('select', value?.username, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    // mutate the default org? and fire the trial mutation on continue to app?
                  }
                  onLoadMore={() => hasNextPage && fetchNextPage()}
                  isLoading={isFetching}
                  ariaName="Select an organization"
                  dataMarketing="Select an organization"
                />
              )}
            />
          </div>
          <GitHubHelpBanner />
        </div>
        {formState?.errors?.apiError && (
          <p className="mb-3 text-xs text-codecov-red">
            We&apos;re sorry for the inconvenience, there was an error with our
            servers. Please try again later or{' '}
            <A to={{ pageName: 'support' }}>Contact support</A>.
          </p>
        )}
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
