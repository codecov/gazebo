import PropTypes from 'prop-types'

import TextInput from 'ui/TextInput'

import { TYPE_PROJECTS } from './config'

function FormEmails({ form, currentUser }) {
  const { typeProjects } = form.watch()
  const { errors } = form.formState

  return (
    <div className="space-y-4 12rem">
      <div>
        {!currentUser.email && (
          <TextInput
            label="Personal email"
            placeholder="example@email.com"
            {...form.register('email')}
          />
        )}
        {errors.email && (
          <p className="text-codecov-red mt-2">{errors.email?.message}</p>
        )}
      </div>
      <div>
        {typeProjects.includes(TYPE_PROJECTS.YOUR_ORG) && (
          <TextInput
            label="Work email"
            placeholder="example@email.com"
            {...form.register('businessEmail')}
          />
        )}
        {errors.businessEmail && (
          <p className="text-codecov-red mt-2">
            {errors.businessEmail?.message}
          </p>
        )}
      </div>
    </div>
  )
}

FormEmails.propTypes = {
  form: PropTypes.shape({
    watch: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    formState: PropTypes.shape({
      errors: PropTypes.shape({
        email: PropTypes.shape({
          message: PropTypes.string,
        }),
        businessEmail: PropTypes.shape({
          message: PropTypes.string,
        }),
      }).isRequired,
    }).isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string,
  }).isRequired,
}

export default FormEmails
