import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useLayoutEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

import config from 'config'

import { SentryBugReporter } from 'sentry'

import umbrellaSvg from 'assets/svg/umbrella.svg'
import { useInternalUser } from 'services/user'
import A from 'ui/A'
import Button from 'ui/Button'
import TextInput from 'ui/TextInput'

import { useSaveTermsAgreement } from './hooks/useTermsOfService'

const FormSchema = z.object({
  marketingName: z.string().min(1, 'Name is required'),
  marketingEmail: z.string().email('Invalid email'),
  marketingConsent: z.boolean().nullish(),
  tos: z.literal(true),
  apiError: z.string().nullish(),
})

type FormData = {
  marketingName?: string
  marketingEmail?: string
  marketingConsent?: boolean
  tos?: boolean
  apiError?: string
}

interface IsDisabled {
  isValid: boolean
  isDirty: boolean
  isMutationLoading: boolean
}

function isDisabled({ isValid, isDirty, isMutationLoading }: IsDisabled) {
  return (!isValid && isDirty) || !isDirty || isMutationLoading
}

interface NameInputProps {
  register: ReturnType<typeof useForm>['register']
  marketingNameMessage?: string
}

function NameInput({ register, marketingNameMessage }: NameInputProps) {
  return (
    <div className="mb-4 mt-2 flex flex-col gap-1">
      <label htmlFor="marketingName" className="cursor-pointer">
        <span className="font-semibold">Enter your name</span>{' '}
      </label>
      <div className="flex max-w-xs flex-col gap-2">
        <TextInput
          {...register('marketingName')}
          type="text"
          id="marketingName"
          placeholder="John Doe"
          dataMarketing="name"
        />
        {marketingNameMessage && (
          <p className="mt-1 text-ds-primary-red">{marketingNameMessage}</p>
        )}
      </div>
    </div>
  )
}

interface EmailInputProps {
  register: ReturnType<typeof useForm>['register']
  marketingEmailMessage?: string
}

function EmailInput({ register, marketingEmailMessage }: EmailInputProps) {
  return (
    <div className="mb-4 mt-2 flex flex-col gap-1">
      <label htmlFor="marketingEmail" className="cursor-pointer">
        <span className="font-semibold">Enter your email</span>{' '}
      </label>
      <div className="flex max-w-xs flex-col gap-2">
        <TextInput
          {...register('marketingEmail')}
          type="text"
          id="marketingEmail"
          placeholder="name@example.com"
          dataMarketing="Email to receive updates"
        />
        {marketingEmailMessage && (
          <p className="mt-1 text-ds-primary-red">{marketingEmailMessage}</p>
        )}
      </div>
    </div>
  )
}

export default function TermsOfService() {
  const { data: currentUser, isLoading: userIsLoading } = useInternalUser({})
  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty, isValid, errors: formErrors },
    setError,
    watch,
    unregister,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
    defaultValues: {
      marketingName: currentUser?.name || '',
      marketingEmail: currentUser?.email || '',
      marketingConsent: undefined,
      tos: false,
      // this field just used for custom form error
      apiError: undefined,
    },
  })

  useEffect(() => {
    if (currentUser && !isDirty) {
      reset({
        marketingName: currentUser.name || '',
        marketingEmail: currentUser.email || '',
        marketingConsent: undefined,
        tos: false,
        apiError: undefined,
      })
    }
  }, [currentUser, isDirty, reset])

  const { mutate, isLoading: isMutationLoading } = useSaveTermsAgreement({
    onSuccess: ({ data }) => {
      if (data?.saveTermsAgreement?.error) {
        setError('apiError', data?.saveTermsAgreement?.error)
        console.error('validation error')
      }
    },
    onError: (error) => setError('apiError', error),
  })

  useLayoutEffect(() => {
    if (!config.SENTRY_DSN) {
      return
    }
    const widget = SentryBugReporter.createWidget()
    return widget.removeFromDom
  }, [])

  const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
    if (!data.marketingName || !data.marketingEmail) return

    mutate({
      businessEmail: data.marketingEmail,
      marketingConsent: data?.marketingConsent,
      name: data.marketingName,
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
      <div className="mt-14 flex gap-2">
        <h1 className="text-2xl font-semibold">Welcome to Codecov</h1>
        <img src={umbrellaSvg.toString()} alt="codecov-umbrella" width="30px" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-4 border-y border-ds-gray-tertiary">
          <div className="my-6 flex flex-col gap-2">
            <NameInput
              register={register}
              marketingNameMessage={formErrors?.marketingName?.message}
            />
            <EmailInput
              register={register}
              marketingEmailMessage={formErrors?.marketingEmail?.message}
            />
            <div className="mt-4 flex gap-2">
              <input
                {...register('marketingConsent')}
                type="checkbox"
                id="marketingConsent"
                aria-label="sign up for marketing emails"
              />
              <label className="cursor-pointer" htmlFor="marketingConsent">
                I would like to receive updates via email{' '}
                <span className="italic">- optional</span>
              </label>
            </div>
            <div className="flex gap-2">
              <input
                {...register('tos')}
                type="checkbox"
                id="tos"
                aria-label="I accept the terms of service and privacy policy"
              />
              <label
                className="cursor-pointer"
                htmlFor="tos"
                aria-label="I agree to the TOS and privacy policy"
              >
                <span className="font-medium">
                  I agree to{' '}
                  <A
                    hook="terms of service"
                    isExternal
                    to={{
                      pageName: 'termsOfService',
                    }}
                  >
                    terms of services
                  </A>{' '}
                  and the{' '}
                  <A
                    hook="privacy policy"
                    isExternal
                    to={{ pageName: 'privacy' }}
                  >
                    privacy policy
                  </A>
                </span>{' '}
              </label>
            </div>
            {formErrors?.tos && (
              <p className="text-ds-primary-red">
                You must accept Terms and Conditions.
              </p>
            )}
          </div>
        </div>
        {formErrors?.apiError && (
          <p className="mb-3 text-ds-primary-red">
            We&apos;re sorry for the inconvenience, there was an error with our
            servers. Please try again later or{' '}
            <A to={{ pageName: 'support' }} hook="support-link" isExternal>
              Contact support
            </A>
            .
          </p>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            to={{ pageName: 'login' }}
            variant="plain"
            disabled={false}
            hook="tos-back-button"
          >
            Back
          </Button>
          <Button
            disabled={isDisabled({
              isValid,
              isDirty,
              isMutationLoading,
            })}
            type="submit"
            hook="user signed tos"
            to={undefined}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
