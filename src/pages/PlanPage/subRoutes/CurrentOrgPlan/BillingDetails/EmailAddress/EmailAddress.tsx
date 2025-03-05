import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { useAccountDetails } from 'services/account/useAccountDetails'
import { useUpdateBillingEmail } from 'services/account/useUpdateBillingEmail'
import { Provider } from 'shared/api/helpers'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import TextInput from 'ui/TextInput'

const emailSchema = z.object({
  newCustomerEmail: z.coerce
    .string()
    .min(1, { message: 'This field has to be filled' })
    .email({ message: 'Invalid email address' }),
})

interface URLParams {
  provider: Provider
  owner: string
}

type FormData = z.infer<typeof emailSchema>

function EmailAddress() {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const currentCustomerEmail =
    accountDetails?.subscriptionDetail?.customer?.email || 'No email provided'

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    defaultValues: {
      newCustomerEmail: currentCustomerEmail,
    },
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
  })

  const { mutate, isLoading } = useUpdateBillingEmail({ provider, owner })

  const submit = (data: FormData) => {
    return mutate(
      { newEmail: data?.newCustomerEmail },
      {
        onSuccess: () => {
          setIsFormOpen(false)
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-2 border-t p-4">
      <div className="flex justify-between">
        <h4 className="font-semibold">Email address</h4>{' '}
        {!isFormOpen && (
          /* @ts-expect-error - A hasn't been typed yet */
          <A
            variant="semibold"
            onClick={() => setIsFormOpen(true)}
            hook="edit-email"
          >
            Edit <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        )}
      </div>
      {isFormOpen ? (
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-2">
          <TextInput
            data-testid="billing-email-input"
            id="billing-email-input"
            placeholder="Your email"
            disabled={isLoading}
            {...register('newCustomerEmail', { required: true })}
          />
          {errors?.newCustomerEmail && (
            <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
              {errors?.newCustomerEmail?.message}
            </p>
          )}
          <div className="flex gap-1">
            <Button
              hook="update-email"
              type="submit"
              variant="primary"
              disabled={!isValid}
            >
              Update
            </Button>
            <Button
              type="button"
              hook="cancel-email"
              variant="plain"
              disabled={isLoading}
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <span>{currentCustomerEmail}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailAddress
