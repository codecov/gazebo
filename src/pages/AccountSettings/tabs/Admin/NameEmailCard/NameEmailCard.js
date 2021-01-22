import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import Card from 'ui/Card'
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

function NameEmailCard({ user }) {
  const { register, handleSubmit, errors, formState } = useForm({
    resolver: yupResolver(getSchema()),
    defaultValues: {
      email: user.email,
      name: user.name,
    },
  })

  const isButtonDisabled = [!formState.isDirty, formState.isSubmitting].some(
    Boolean
  )

  function submit(...args) {
    console.log(args)
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
              name="name"
              placeholder="Your name"
              ref={register}
            />
            {errors.name && (
              <p className="text-error-900 mt-1">{errors.name?.message}</p>
            )}
          </div>
          <div className="w-full md:w-1/2 ml-2 mt-4 md:mt-0">
            <label htmlFor="email-edit" className="bold">
              Email
            </label>
            <TextInput
              id="email-edit"
              className="mt-2"
              name="email"
              placeholder="Your email"
              ref={register}
            />
            {errors.email && (
              <p className="text-error-900 mt-1">{errors.email?.message}</p>
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
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
}

export default NameEmailCard
