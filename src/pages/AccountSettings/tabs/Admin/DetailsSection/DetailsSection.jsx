import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { useAddNotification } from 'services/toastNotification'
import { useUpdateProfile } from 'services/user'
import Button from 'ui/Button'
import TextInput from 'ui/TextInput'

const detailsSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email('Not a valid email').nonempty('Email is required'),
})

function DetailsSection({ email, name }) {
  const { provider } = useParams()
  const addToast = useAddNotification()
  const {
    register,
    handleSubmit,
    formState: { isDirty, errors: formErrors },
    reset,
  } = useForm({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      email,
      name,
    },
    mode: 'onChange',
  })

  const { mutate, isLoading } = useUpdateProfile({ provider })
  const queryClient = useQueryClient()

  const isButtonDisabled = !isDirty || isLoading

  function submit(formData) {
    mutate(formData, {
      onSuccess: ({ data }) => {
        const updatedUser = data?.updateProfile?.me

        queryClient.invalidateQueries(['user', provider])

        addToast({
          type: 'success',
          text: 'Information successfully updated',
        })
        reset({
          email: updatedUser.email,
          name: updatedUser.user.name,
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
    <form onSubmit={handleSubmit(submit)} className="mt-2 flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Your details</h3>
      <hr />
      <div className="flex flex-col gap-1 md:w-1/2">
        <TextInput
          data-testid="name-input"
          dataMarketing="email-card-edit-name"
          id="name-edit"
          placeholder="Your name"
          disabled={isLoading}
          {...register('name', { required: true })}
          label="Name"
        />
        {formErrors.name && (
          <p className="text-ds-error-nonary">{formErrors.name?.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1 md:w-1/2">
        <TextInput
          data-testid="email-input"
          dataMarketing="email-card-edit-email"
          id="email-edit"
          placeholder="Your email"
          disabled={isLoading}
          {...register('email', { required: true })}
          label="Email"
        />
        {formErrors.email && (
          <p className="text-ds-error-nonary">{formErrors.email?.message}</p>
        )}
      </div>
      <div>
        <Button
          type="submit"
          disabled={isButtonDisabled}
          hook="Update personal information"
        >
          Save changes
        </Button>
      </div>
    </form>
  )
}

DetailsSection.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
}

export default DetailsSection
