import { yupResolver } from '@hookform/resolvers/yup'
import noop from 'lodash/noop'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ReactModal from 'react-modal'

import { useOnboardUser } from 'services/user'
import Button from 'ui/Button'
import BaseModal from 'ui/Modal/BaseModal'

import { getInitialDataForm, getSchema, shouldGoToEmailStep } from './config'
import FormEmails from './FormEmails'
import FormInformation from './FormInformation'
import { useOnboardingTracking } from './useOnboardingTracking'

function usePerStepProp({ currentUser }) {
  const form = useForm({
    reValidateMode: 'onSubmit',
    defaultValues: getInitialDataForm(currentUser),
    resolver: yupResolver(getSchema()),
  })
  const [step, setStep] = useState(0)
  const formData = form.watch()
  const { secondPage, completedOnboarding } = useOnboardingTracking()
  const { mutate, isLoading } = useOnboardUser({
    onSuccess: (user, data) => completedOnboarding(user, data),
    data: formData,
  })

  const onSubmit = form.handleSubmit(() => {
    if (step === 0 && shouldGoToEmailStep(formData)) {
      secondPage()
      setStep(1)
      return
    }
    mutate(formData)
  })

  const propsPerStep = {
    0: {
      onSubmit,
      title: 'Welcome to Codecov',
      subtitle:
        'Let us know what best describes you and your workflow and we’ll get started',
      body: <FormInformation form={form} />,
      footer: (
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={
            formData.goals.length === 0 || formData.typeProjects.length === 0
          }
          hook="user-onboarding-next-page"
        >
          Next
        </Button>
      ),
    },
    1: {
      title: 'Your profile details',
      subtitle: 'Help us keep your contact information up to date',
      onSubmit,
      body: <FormEmails form={form} currentUser={currentUser} />,
      footer: (
        <Button
          variant="primary"
          isLoading={isLoading}
          type="submit"
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
  const { onSubmit, ...stepProps } = usePerStepProp({ currentUser })
  const { startOnboarding } = useOnboardingTracking()

  return (
    <ReactModal
      isOpen
      onRequestClose={noop}
      onAfterOpen={startOnboarding}
      className="h-screen w-screen flex items-center justify-center"
      overlayClassName="fixed top-0 bottom-0 left-0 right-0 bg-ds-gray-octonary z-10"
    >
      <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
        <form className="sm:w-full md:w-2/3 lg:w-1/3 mt-8" onSubmit={onSubmit}>
          <BaseModal hasCloseButton={false} onClose={noop} {...stepProps} />
        </form>
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
