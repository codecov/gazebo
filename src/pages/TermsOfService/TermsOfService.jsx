import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import Select from 'ui/Select'
import TextInput from 'ui/TextInput'

import { useMyOrganizations } from './hooks/useMyOrganizations'
import { useSaveTermsAgreement } from './hooks/useTermsOfService'

const FormSchema = z.object({
  select: z.string().nullish(),
  marketingEmail: z.string().email('This is not a valid email.').nullish(),
  marketingConsent: z.boolean().nullish(),
  tos: z.literal(true),
})

function isDisabled({ isValid, isDirty }) {
  return (!isValid && isDirty) || !isDirty
}

// eslint-disable-next-line complexity
export default function TermsOfService() {
  const { register, control, handleSubmit, formState, setValue, setError } =
    useForm({
      resolver: zodResolver(FormSchema),
      mode: 'onChange',
    })
  const { mutate } = useSaveTermsAgreement({
    onSuccess: ({ data }) => {
      if (data?.updateDefaultOrganization?.error) {
        setError('apiError', data?.updateDefaultOrganization?.error)
      }
      if (data?.saveTermsAgreement?.error) {
        setError('apiError', data?.saveTermsAgreement?.error)
        console.error('validation error')
      }
    },
    onError: (error) => setError('apiError', error),
  })
  const { data: currentUser, isLoading: userIsLoading } = useUser()

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
    if (data.marketingConsent) {
      const segmentEvent = {
        event: 'Onboarding email opt in',
        data: {
          email: data?.marketingEmail || currentUser?.email,
          ownerid: currentUser?.trackingMetadata?.ownerid,
          username: currentUser?.user?.username,
        },
      }
      trackSegmentEvent(segmentEvent)
    }

    const input = {
      businessEmail: data?.marketingEmail || currentUser?.email,
      termsAgreement: true,
    }

    if (data.select) {
      input.defaultOrg = data.select
    }

    mutate(input)
  }

  if (userIsLoading) return null

  return (
    <div className="mx-auto w-full max-w-[38rem] text-sm text-ds-gray-octonary">
      <h1 className="pt-20 pb-3 text-2xl font-semibold">Welcome to Codecov</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 border-y border-ds-gray-tertiary pt-6">
          <p className="font-semibold">Select organization</p>
          <div className="max-w-[15rem] py-1">
            <Controller
              name="select"
              control={control}
              render={() => (
                <Select
                  register={register}
                  required
                  placeholder="Select an organization"
                  items={myOrganizations || []}
                  renderItem={(item) => item?.username}
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
          </div>
          <p className="text-xs text-ds-gray-quaternary">
            Don&apos;t see your org?{' '}
            <A
              href="https://docs.codecov.com/docs/video-guide-connecting-codecov-to-github"
              hook="help finding an org"
              isExternal
            >
              Help finding org
              <Icon name="chevronRight" size="sm" variant="solid" />
            </A>
          </p>
          {/* Prompt user for an email if their email is not shared through the provider, needed for marketing consent */}
          {!currentUser?.email && (
            <div className="mt-3 flex flex-col gap-1">
              <label htmlFor="marketingEmail" className="cursor-pointer">
                <span className="font-semibold">Contact email</span> required
              </label>
              <div className="flex max-w-xs flex-col gap-2">
                <TextInput
                  {...register('marketingEmail', {
                    required: !!currentUser?.email,
                  })}
                  type="text"
                  id="marketingEmail"
                  placeholder="Email to receive updates"
                  dataMarketing="Email to receive updates"
                />
                {formState.errors?.marketingEmail && (
                  <p className="mt-1 text-codecov-red">
                    {formState.errors?.marketingEmail.message}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="my-6 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                {...register('marketingConsent')}
                type="checkbox"
                id="marketingConsent"
                aria-label="sign up for marketing emails"
              />
              <label className="cursor-pointer" htmlFor="marketingConsent">
                I would like to receive updates via email
                {currentUser?.email && (
                  <>
                    {' '}
                    <span className="text-xs text-ds-gray-quaternary">
                      ({currentUser?.email})
                    </span>
                  </>
                )}
              </label>
            </div>
            <div className="flex gap-2">
              <input
                {...register('tos', { required: true })}
                type="checkbox"
                id="tos"
                aria-label="I accept the terms of service and privacy policy"
              />
              <label
                className="cursor-pointer"
                htmlFor="tos"
                aria-label="I agree to the TOS and privacy policy"
              >
                <span className="font-semibold">
                  I agree to{' '}
                  <A
                    href="https://about.codecov.io/terms-of-service"
                    hook="terms of service"
                    isExternal
                  >
                    terms of services
                  </A>{' '}
                  and the{' '}
                  <A
                    href="https://about.codecov.io/privacy"
                    hook="privacy policy"
                    isExternal
                  >
                    privacy policy
                  </A>
                </span>{' '}
                required
              </label>
            </div>
            {formState.errors?.tos && (
              <p className="text-codecov-red">
                You must accept Terms and Conditions.
              </p>
            )}
          </div>
        </div>
        {formState?.errors?.apiError && (
          <p className="mb-3 text-codecov-red">
            We&apos;re sorry for the inconvenience, there was an error with our
            servers. Please try again later or{' '}
            <A to={{ pageName: 'support' }}>Contact support</A>.
          </p>
        )}
        <Button
          disabled={isDisabled(formState)}
          type="submit"
          hook="user signed tos"
        >
          Continue
        </Button>
      </form>
    </div>
  )
}
