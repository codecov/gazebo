import { useState } from 'react'
import { useForm } from 'react-hook-form'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

import FormInformation from './FormInformation'
import FormEmails from './FormEmails'

function usePerStepProp(form) {
  const [step, setStep] = useState(0)

  const typeProjects = form.watch('typeProjects')
  const goals = form.watch('goals')

  const propsPerStep = {
    0: {
      body: <FormInformation form={form} />,
      footer: (
        <Button
          onClick={() => setStep(1)}
          variant="primary"
          disabled={goals.length === 0 || typeProjects.length === 0}
        >
          Next
        </Button>
      ),
    },
    1: {
      body: <FormEmails form={form} />,
      footer: (
        <Button variant="primary" onClick={() => setStep(1)}>
          Submit
        </Button>
      ),
    },
  }
  return propsPerStep[step]
}

function UserOnboardingModal() {
  const form = useForm({
    defaultValues: {
      email: '',
      businessEmail: '',
      typeProjects: [],
      goals: [],
      otherGoal: '',
    },
  })
  const stepProps = usePerStepProp(form)

  return (
    <Modal
      isOpen
      hasCloseButton={false}
      onClose={() => null}
      title="Welcome to Codecov"
      subtitle="Let us know what best describes you and your workflow and we’ll get started"
      {...stepProps}
    />
  )
}

export default UserOnboardingModal
