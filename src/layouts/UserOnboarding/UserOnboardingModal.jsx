import noop from 'lodash/noop'
import PropTypes from 'prop-types'
import { useState } from 'react'
import ReactModal from 'react-modal'
import { useHistory, useParams } from 'react-router-dom'

import OrganizationSelector from './OrganizationSelector'
import { useOnboardingTracking } from './useOnboardingTracking'
import UserOnboardingForm from './UserOnboardingForm'

import { useOnboardUser } from '../../services/user'

function UserOnboardingModal({ currentUser }) {
  const { startOnboarding, completedOnboarding, skipOnboarding } =
    useOnboardingTracking()
  const history = useHistory()
  const { provider } = useParams()

  const [formData, setFormData] = useState(false)

  const { mutate, isLoading } = useOnboardUser({
    onSuccess: (successData, data) => {
      const user = successData?.user
      const selectedOrg = successData?.selectedOrg
      completedOnboarding(user, data)
      if (selectedOrg) {
        history.replace(`/${provider}/${selectedOrg.username}`)
      }
    },
    data: formData,
  })

  return (
    <ReactModal
      isOpen
      onRequestClose={noop}
      onAfterOpen={startOnboarding}
      className="flex h-screen w-screen items-center justify-center"
      overlayClassName="fixed inset-0 bg-ds-gray-octonary z-10"
    >
      <div className="flex h-full w-full items-center justify-center overflow-y-auto p-4">
        {Boolean(formData) ? (
          <OrganizationSelector
            currentUser={currentUser}
            onSelect={({ selectedOrg }) => {
              mutate({ formData, selectedOrg })
            }}
            onOnboardingSkip={() => {
              skipOnboarding()
              mutate({ formData })
            }}
          />
        ) : (
          <UserOnboardingForm
            currentUser={currentUser}
            onFormSubmit={(formData) => setFormData(formData)}
            isSubmitting={isLoading}
          />
        )}
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
