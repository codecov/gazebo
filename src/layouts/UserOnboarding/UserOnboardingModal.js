import { useState } from 'react'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

import FormInformation from './FormInformation'
import FormEmails from './FormEmails'

function UserOnboardingModal() {
  const [step, setStep] = useState(0)
  const propsPerStep = {
    0: {
      body: <FormInformation />,
      footer: <Button onClick={() => setStep(1)}>Next step</Button>,
    },
    1: {
      body: <FormEmails />,
      footer: <Button onClick={() => setStep(1)}>Submit</Button>,
    },
  }
  const stepProps = propsPerStep[step]

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
