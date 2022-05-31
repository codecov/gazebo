import { yupResolver } from '@hookform/resolvers/yup'
import noop from 'lodash/noop'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import Button from 'ui/Button'
import BaseModal from 'ui/Modal/BaseModal'

import { getInitialDataForm, getSchema, shouldGoToEmailStep } from './config'
import FormEmails from './FormEmails'
import FormInformation from './FormInformation'
import { useOnboardingTracking } from './useOnboardingTracking'

import { useFlags } from '../../shared/featureFlags'

function usePerStepProp({ currentUser, onFormSubmit, isSubmitting }) {
  const form = useForm({
    reValidateMode: 'onSubmit',
    defaultValues: getInitialDataForm(currentUser),
    resolver: yupResolver(getSchema()),
  })

  const { onboardingOrganizationSelector } = useFlags({
    onboardingOrganizationSelector: false,
  })

  const formData = form.watch()
  const { secondPage } = useOnboardingTracking()

  const [step, setStep] = useState(0)

  const onSubmit = form.handleSubmit(() => {
    if (step === 0) {
      if (shouldGoToEmailStep(formData)) {
        secondPage()
        setStep(1)
      } else {
        onFormSubmit(formData)
      }
    } else if (step === 1) {
      onFormSubmit(formData)
    }
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
      footer: onboardingOrganizationSelector ? (
        <Button variant="primary" type="submit">
          Next
        </Button>
      ) : (
        <Button
          variant="primary"
          isLoading={isSubmitting}
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

function UserOnboardingForm({ currentUser, onFormSubmit, isSubmitting }) {
  const { onSubmit, ...stepProps } = usePerStepProp({
    currentUser,
    onFormSubmit,
    isSubmitting,
  })

  return (
    <form className="sm:w-full md:w-2/3 lg:w-1/3 mt-8" onSubmit={onSubmit}>
      <BaseModal hasCloseButton={false} onClose={noop} {...stepProps} />
    </form>
  )
}

UserOnboardingForm.propTypes = {
  currentUser: PropTypes.shape({
    email: PropTypes.string,
  }).isRequired,
  onFormSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
}

export default UserOnboardingForm
