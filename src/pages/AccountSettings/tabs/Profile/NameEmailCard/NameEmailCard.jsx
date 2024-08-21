import { zodResolver } from '@hookform/resolvers/zod'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Card from 'old_ui/Card'
import { useAddNotification } from 'services/toastNotification'
import { useUpdateProfile } from 'services/user'
import Button from 'ui/Button'
import TextInput from 'ui/TextInput'

function getSchema() {
  return z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z
      .string()
      .email('Not a valid email')
      .min(1, { message: 'Email is required' }),
  })
}

function NameEmailCard({ currentUser, provider }) {
  const addToast = useAddNotification()
  const {
    register,
    handleSubmit,
    formState: { isDirty, errors: formErrors },
    reset,
  } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      email: currentUser?.email,
      name: currentUser?.name,
    },
  })

  const { mutate, isLoading } = useUpdateProfile({ provider })

  const isButtonDisabled = !isDirty || isLoading

  function submit(formData) {
    mutate(formData, {
      onSuccess: (updatedUser) => {
        addToast({
          type: 'success',
          text: 'Information successfully updated',
        })
        reset({
          email: updatedUser?.email,
          name: updatedUser?.name,
        })
      },
      onError: () => {
        addToast({
          type: 'error',
          text: 'Something went wrong',
        })
      },
    })
  }

  return (
    <Card variant="old" className="p-10">
      {/* Define the field first and the submit/title after so the TAB order makes sense for accessibility but we reverse the two so it looks like the correct UI */}
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Your details</h1>
          <Button
            type="submit"
            disabled={isButtonDisabled}
            hook="Update personal information"
          >
            Save changes
          </Button>
        </div>
        <div className="flex flex-col justify-between gap-2 md:flex-row md:gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="name-edit" className="bold">
              Name
            </label>
            <TextInput
              dataMarketing="self-hosted-email-card-edit-name"
              id="name-edit"
              placeholder="Your name"
              disabled={isLoading}
              {...register('name', { required: true })}
            />
            {formErrors.name && (
              <p className="mt-1 text-ds-error-nonary">
                {formErrors.name.message}
              </p>
            )}
          </div>
          <div className="w-full md:mt-0 md:w-1/2">
            <label htmlFor="email-edit" className="bold">
              Email
            </label>
            <TextInput
              dataMarketing="self-hosted-email-card-edit-email"
              id="email-edit"
              placeholder="Your email"
              disabled={isLoading}
              {...register('email', { required: true })}
            />
            {formErrors.email && (
              <p className="mt-1 text-ds-error-nonary">
                {formErrors.email.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}

NameEmailCard.propTypes = {
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
  }),
  provider: PropTypes.string.isRequired,
}

export default NameEmailCard
