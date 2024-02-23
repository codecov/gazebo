import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

import umbrellaSvg from 'assets/svg/umbrella.svg'
import { CustomerIntent, useInternalUser } from 'services/user'
import A from 'ui/A'
import Button from 'ui/Button'
import RadioInput from 'ui/RadioInput/RadioInput'
import TextInput from 'ui/TextInput'

import { useSaveTermsAgreement } from './hooks/useTermsOfService'

const FormSchema = z.object({
  marketingEmail: z.string().email().nullish(),
  marketingConsent: z.boolean().nullish(),
  tos: z.literal(true),
  customerIntent: z.string(),
})

interface IsDisabled {
  isValid: boolean
  isDirty: boolean
  isMutationLoading: boolean
}

function isDisabled({ isValid, isDirty, isMutationLoading }: IsDisabled) {
  return (!isValid && isDirty) || !isDirty || isMutationLoading
}

interface EmailInputProps {
  register: ReturnType<typeof useForm>['register']
  marketingEmailMessage?: string
  showEmailRequired: boolean
}

function EmailInput({
  register,
  marketingEmailMessage,
  showEmailRequired,
}: EmailInputProps) {
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

export default function TermsOfService() {
  const { register, handleSubmit, formState, setError, watch, unregister } =
    useForm({
      resolver: zodResolver(FormSchema),
      mode: 'onChange',
    })
  const { mutate, isLoading: isMutationLoading } = useSaveTermsAgreement({
    onSuccess: ({ data }) => {
      if (data?.saveTermsAgreement?.error) {
        setError('apiError', data?.saveTermsAgreement?.error)
        console.error('validation error')
      }
    },
    onError: (error) => setError('apiError', error),
  })
  const { data: currentUser, isLoading: userIsLoading } = useInternalUser({})

  interface FormValues {
    marketingEmail?: string
    marketingConsent?: boolean
    customerIntent?: string
  }

  const onSubmit: SubmitHandler<FormValues> = (data: FormValues) => {
    mutate({
      businessEmail: data?.marketingEmail || currentUser?.email,
      termsAgreement: true,
      marketingConsent: data?.marketingConsent,
      customerIntent: data?.customerIntent || CustomerIntent.PERSONAL,
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
            <label htmlFor="customerIntent" className="mb-2 font-semibold">
              What brings you to Codecov?
            </label>
            <div className="bg-ds-gray-primary p-4">
              <RadioInput
                {...register('customerIntent')}
                // @ts-expect-error
                dataMarketing="Personal use"
                id="customerIntent"
                aria-label="Personal use"
                label="Personal Use"
                value={CustomerIntent.PERSONAL}
              />
              <p className="ml-5 text-ds-gray-quinary">
                For Open Source and single developer projects, always free
              </p>
            </div>
            <div className="bg-ds-gray-primary p-4">
              <RadioInput
                {...register('customerIntent')}
                // @ts-expect-error
                dataMarketing="Business use"
                id="customerIntent"
                aria-label="Business use"
                label="Business Use"
                value={CustomerIntent.BUSINESS}
              />
              <p className="ml-5 text-ds-gray-quinary">
                For development teams, start with a two week free trial
              </p>
            </div>
            <div className="mt-4 flex gap-2">
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
              // @ts-expect-error
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
            <A to={{ pageName: 'support' }} hook="support-link" isExternal>
              Contact support
            </A>
            .
          </p>
        )}
        <div className="mt-3 flex justify-end">
          <Button
            disabled={isDisabled({
              isValid: formState.isValid,
              isDirty: formState.isDirty,
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
