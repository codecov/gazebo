import Checkbox from 'ui/Checkbox'
import TextInput from 'ui/TextInput'

const TYPE_PROJECTS = [
  {
    label: 'Personal',
  },
  {
    label: 'Your organization',
  },
  {
    label: 'Open source',
  },
  {
    label: 'Educational',
  },
]

const GOALS = [
  {
    label: 'Just starting to write tests',
  },
  {
    label: 'Improving my code coverage',
  },
  {
    label: 'Maintaining my code coverage',
  },
]

function FormInformation() {
  return (
    <div>
      <h3 className="font-semibold">What type of projects brings you here?</h3>
      {TYPE_PROJECTS.map((typeProject) => (
        <Checkbox label={typeProject.label} key={typeProject.label} />
      ))}
      <h3 className="font-semibold">What is your goal we can help with?</h3>
      {GOALS.map((typeProject) => (
        <Checkbox label={typeProject.label} key={typeProject.label} />
      ))}
      <div className="flex items-start">
        <Checkbox label="Other" showLabel={false} />
        <TextInput placeholder="Other" />
      </div>
    </div>
  )
}

export default FormInformation
