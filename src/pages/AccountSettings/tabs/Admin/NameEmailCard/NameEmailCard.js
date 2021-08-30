import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import Card from 'old_ui/Card'
import Button from 'old_ui/Button'
import TextInput from 'old_ui/TextInput'
import { useAddNotification } from 'services/toastNotification'
import { useUpdateProfile } from 'services/user'

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
      <form onSubmit={handleSubmit(submit)} className="flex flex-col-reverse">
        <div className="flex justify-between mt-8 flex-col md:flex-row">
          <div className="w-full md:w-1/2 mr-2">
            <label htmlFor="name-edit" className="bold">
              Name
            </label>
            <TextInput
              id="name-edit"
              className="mt-2"
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
          <div className="w-full md:w-1/2 ml-2 mt-4 md:mt-0">
            <label htmlFor="email-edit" className="bold">
              Email
            </label>
            <TextInput
              id="email-edit"
              className="mt-2"
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl bold">Your details</h1>
          <Button type="submit" disabled={isButtonDisabled}>
            Save changes
          </Button>
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
