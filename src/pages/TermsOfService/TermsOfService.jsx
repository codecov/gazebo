import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

const FormSchema = z.object({
  select: z.string().nonempty(),
  marketingEmail: z.boolean().nullish(),
  tos: z.literal(true),
})

export default function TermsOfService() {
  const { register, control, handleSubmit, formState, setValue } = useForm({
    resolver: zodResolver(FormSchema),
  })
  const onSubmit = (data) => {
    /*
     TODO: send TOS and default Org to backend, marketing opt-in to marketo,
     invalidate current user query to re render current route and
     return to normal state.
    */
    console.log(data)
  }

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
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  register={register}
                  required
                  placeholder="Select an organization"
                  items={['horizon zero dawn', 'shovel knight', 'hades']}
                  onChange={(value) => setValue('select', value)}
                  ariaName="Select an organization"
                  dataMarketing="Select an organization"
                ></Select>
              )}
            />
          </div>
          <p className="text-xs text-ds-gray-quaternary">
            Don&apos;t see your org?{' '}
            <A href="#" hook="help finding an org">
              Help finding org
              <Icon name="chevronRight" size="sm" variant="solid" />
            </A>
          </p>
          <div className="my-6 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                {...register('marketingEmail')}
                type="checkbox"
                id="marketingEmail"
                aria-label="I would like to receive updates via email"
              />
              <label className="cursor-pointer" htmlFor="marketingEmail">
                I would like to receive updates via email
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
                  >
                    terms of services
                  </A>{' '}
                  and the{' '}
                  <A
                    href="https://about.codecov.io/privacy"
                    hook="privacy policy"
                  >
                    privacy policy
                  </A>
                </span>{' '}
                required
              </label>
            </div>
          </div>
        </div>
        <Button
          disabled={
            (!formState.isValid && formState.isDirty) || !formState.isDirty
          }
          type="submit"
          hook="user signed tos"
        >
          Continue
        </Button>
      </form>
    </div>
  )
}
