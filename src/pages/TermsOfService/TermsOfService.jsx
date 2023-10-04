import { zodResolver } from '@hookform/resolvers/zod'
import PropType from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUser } from 'services/user'
import A from 'ui/A'
import Button from 'ui/Button'
import TextInput from 'ui/TextInput'

import { useSaveTermsAgreement } from './hooks/useTermsOfService'

const FormSchema = z.object({
  marketingEmail: z.string().email().nullish(),
  marketingConsent: z.boolean().nullish(),
  tos: z.literal(true),
})

function isDisabled({ isValid, isDirty }) {
  return (!isValid && isDirty) || !isDirty
}

function EmailInput({ register, marketingEmailMessage, showEmailRequired }) {
  if (!showEmailRequired) return null

  return (
    <div className="mb-4 mt-2 flex flex-col gap-1">
      <label htmlFor="marketingEmail" className="cursor-pointer">
        <span className="font-semibold">Contact email</span>{' '}
        <small className="text-xs">required</small>
      </label>
      <div className="flex max-w-xs flex-col gap-2">
        <TextInput
          {...register('marketingEmail', {
            required: true,
          })}
          type="text"
          id="marketingEmail"
          placeholder="Email to receive updates"
          dataMarketing="Email to receive updates"
        />
        {marketingEmailMessage && (
          <p className="mt-1 text-codecov-red">{marketingEmailMessage}</p>
        )}
      </div>
    </div>
  )
}

EmailInput.propTypes = {
  register: PropType.func.isRequired,
  marketingEmailMessage: PropType.string,
  showEmailRequired: PropType.bool.isRequired,
}

export default function TermsOfService() {
  const { register, handleSubmit, formState, setError, watch, unregister } =
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

  const onSubmit = (data) => {
    mutate({
      businessEmail: data?.marketingEmail || currentUser?.email,
      termsAgreement: true,
    })
  }

  useEffect(() => {
    // https://reacthookform.caitouyun.com/api/useform/watch/
    const subscription = watch((value, { name }) => {
      if (name === 'marketingConsent') {
        if (value) {
          unregister('marketingEmail')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, unregister])

  if (userIsLoading) return null

  return (
    <div className="mx-auto w-full max-w-[38rem] text-sm text-ds-gray-octonary">
      <h1 className="mt-14 text-2xl font-semibold">Welcome to Codecov</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-4 border-y border-ds-gray-tertiary">
          <div className="my-12 flex flex-col gap-2">
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
            <EmailInput
              register={register}
              marketingEmailMessage={formState.errors?.marketingEmail?.message}
              showEmailRequired={
                watch('marketingConsent') && !currentUser?.email
              }
            />
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
                <small className="text-xs">required</small>
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
        <div className="mt-3 flex justify-end">
          <Button
            disabled={isDisabled(formState)}
            type="submit"
            hook="user signed tos"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
