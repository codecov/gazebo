import PropTypes from 'prop-types'

import TextInput from 'ui/TextInput'

import { TYPE_PROJECTS } from './config'

function FormEmails({ form }) {
  const { typeProjects } = form.watch()

  return (
    <div>
      <TextInput
        label="Personal email"
        placeholder="example@email.com"
        {...form.register('email')}
      />
      {typeProjects.includes(TYPE_PROJECTS.YOUR_ORG) && (
        <TextInput
          label="Work email"
          placeholder="example@email.com"
          {...form.register('email')}
        />
      )}
    </div>
  )
}

FormEmails.propTypes = {
  form: PropTypes.shape({
    watch: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
  }).isRequired,
}

export default FormEmails
