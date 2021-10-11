import PropTypes from 'prop-types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import noop from 'lodash/noop'
import ReactModal from 'react-modal'

import BaseModal from 'ui/Modal/BaseModal'
import Button from 'ui/Button'

import FormInformation from './FormInformation'
import FormEmails from './FormEmails'
import { getInitialDataForm } from './config'

function usePerStepProp(form) {
  const [step, setStep] = useState(0)
  const { typeProjects, goals } = form.watch()

  const propsPerStep = {
    0: {
      body: <FormInformation form={form} />,
      footer: (
        <Button
          onClick={() => setStep(1)}
          variant="primary"
          disabled={goals.length === 0 || typeProjects.length === 0}
          hook="user-onboarding-next-page"
        >
          Next
        </Button>
      ),
    },
    1: {
      body: <FormEmails form={form} />,
      footer: (
        <Button
          variant="primary"
          onClick={console.log}
          hook="user-onboarding-submit"
        >
          Submit
        </Button>
      ),
    },
  }
  return propsPerStep[step]
}

function UserOnboardingModal({ currentUser }) {
  const form = useForm({
    defaultValues: getInitialDataForm(currentUser),
  })
  const stepProps = usePerStepProp(form)

  return (
    <ReactModal
      isOpen
      onRequestClose={noop}
      className="h-screen w-screen flex items-center justify-center"
      overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-ds-gray-octonary z-10"
    >
      <div className="w-1/3">
        <BaseModal
          title="Welcome to Codecov"
          subtitle="Let us know what best describes you and your workflow and we’ll get started"
          hasCloseButton={false}
          onClose={noop}
          {...stepProps}
        />
      </div>
    </ReactModal>
  )
}

UserOnboardingModal.propTypes = {
  currentUser: PropTypes.shape({
    email: PropTypes.string,
  }).isRequired,
}

export default UserOnboardingModal
