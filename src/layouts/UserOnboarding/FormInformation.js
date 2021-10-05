import PropTypes from 'prop-types'

import Checkbox from 'ui/Checkbox'
import TextInput from 'ui/TextInput'

const TYPE_PROJECTS = [
  {
    label: 'Personal',
    value: 'PERSONAL',
  },
  {
    label: 'Your organization',
    value: 'YOUR_ORG',
  },
  {
    label: 'Open source',
    value: 'OPEN_SOURCE',
  },
  {
    label: 'Educational',
    value: 'EDUCATIONAL',
  },
]

const GOALS = [
  {
    label: 'Just starting to write tests',
    value: 'STARTING_WITH_TESTS',
  },
  {
    label: 'Improving my code coverage',
    value: 'IMPROVE_COVERAGE',
  },
  {
    label: 'Maintaining my code coverage',
    value: 'MAINTAIN_COVERAGE',
  },
  {
    label: 'Team / regulatory requirement',
    value: 'TEAM_REQUIREMENTS',
  },
]

function toggleInList(list, elem) {
  return list.includes(elem)
    ? list.filter((item) => item !== elem)
    : [...list, elem]
}

function FormInformation({ form }) {
  const { typeProjects, goals, otherGoal } = form.watch()

  function updateState(fieldName, list, value) {
    return () => form.setValue(fieldName, toggleInList(list, value))
  }

  return (
    <div>
      <h3 className="font-semibold">What type of projects brings you here?</h3>
      {TYPE_PROJECTS.map(({ label, value }) => (
        <Checkbox
          label={label}
          key={value}
          onChange={updateState('typeProjects', typeProjects, value)}
          checked={typeProjects.includes(value)}
        />
      ))}
      <h3 className="font-semibold">What is your goal we can help with?</h3>
      {GOALS.map(({ label, value }) => (
        <Checkbox
          label={label}
          key={label}
          onChange={updateState('goals', goals, value)}
          checked={goals.includes(value)}
        />
      ))}
      <div className="flex items-start">
        <Checkbox
          label="Other"
          showLabel={false}
          onChange={updateState('goals', goals, 'OTHER')}
          checked={goals.includes('OTHER') || otherGoal.length > 0}
        />
        <TextInput placeholder="Other" {...form.register('otherGoal')} />
      </div>
    </div>
  )
}

FormInformation.propTypes = {
  form: PropTypes.shape({
    watch: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
  }).isRequired,
}

export default FormInformation
