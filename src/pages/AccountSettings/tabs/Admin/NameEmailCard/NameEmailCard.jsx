import { yupResolver } from '@hookform/resolvers/yup'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

import Card from 'old_ui/Card'
import { useAddNotification } from 'services/toastNotification'
import { useUpdateProfile } from 'services/user'
import Button from 'ui/Button'
import TextInput from 'ui/TextInput'


function getSchema() {
  return yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup
      .string()
      .email('Not a valid email')
      .required('Email is required'),
  })
}

function NameEmailCard({ currentUser, provider }) {
  const addToast = useAddNotification()
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: yupResolver(getSchema()),
    defaultValues: {
      email: currentUser.email,
      name: currentUser.user.name,
    },
  })

  const { mutate, isLoading } = useUpdateProfile({ provider })

  const isButtonDisabled = !formState.isDirty || isLoading

  function submit(formData) {
    mutate(formData, {
      onSuccess: (updatedUser) => {
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
    <Card className="p-10">
      {/* Define the field first and the submit/title after so the TAB order makes sense for accessibility but we reverse the two so it looks like the correct UI */}
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl bold">Your details</h1>
          <Button
            type="submit"
            disabled={isButtonDisabled}
            hook="Update personal information"
          >
            Save changes
          </Button>
        </div>
        <div className="flex justify-between flex-col md:flex-row gap-2 md:gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="name-edit" className="bold">
              Name
            </label>
            <TextInput
              id="name-edit"
              placeholder="Your name"
              disabled={isLoading}
              {...register('name', { required: true })}
            />
            {formState?.errors.name && (
              <p className="text-error-900 mt-1">
                {formState?.errors.name?.message}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/2 md:mt-0">
            <label htmlFor="email-edit" className="bold">
              Email
            </label>
            <TextInput
              id="email-edit"
              placeholder="Your email"
              disabled={isLoading}
              {...register('email', { required: true })}
            />
            {formState.errors.email && (
              <p className="text-error-900 mt-1">
                {formState.errors.email?.message}
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
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  }),
  provider: PropTypes.string.isRequired,
}

export default NameEmailCard
