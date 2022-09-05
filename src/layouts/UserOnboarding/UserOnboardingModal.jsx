import noop from 'lodash/noop'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import { useHistory, useParams } from 'react-router-dom'

import OrganizationSelector from './OrganizationSelector'
import { useOnboardingTracking } from './useOnboardingTracking'
import UserOnboardingForm from './UserOnboardingForm'

import { useOnboardUser } from '../../services/user'
import { useFlags } from '../../shared/featureFlags'

function UserOnboardingModal({ currentUser }) {
  const { startOnboarding, completedOnboarding, skipOnboarding } =
    useOnboardingTracking()
  const history = useHistory()
  const { provider } = useParams()

  const { onboardingOrganizationSelector } = useFlags({
    onboardingOrganizationSelector: false,
  })

  const [formData, setFormData] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState()
  const [selectedRepo, setSelectedRepo] = useState()

  const { mutate, isLoading } = useOnboardUser({
    onSuccess: (user, data) => {
      completedOnboarding(user, data)
      if (selectedOrg && selectedRepo) {
        history.replace(
          `/${provider}/${selectedOrg.username}/${selectedRepo.name}${
            selectedRepo.active ? '' : '/new'
          }`
        )
      }
    },
    data: formData,
  })

  useEffect(() => {
    if (Boolean(selectedRepo)) {
      mutate(formData)
    }
  }, [selectedRepo, formData, mutate])

  return (
    <ReactModal
      isOpen
      onRequestClose={noop}
      onAfterOpen={startOnboarding}
      className="h-screen w-screen flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-ds-gray-octonary z-10"
    >
      <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center">
        {Boolean(formData) ? (
          <OrganizationSelector
            currentUser={currentUser}
            onSelect={({ selectedOrg, selectedRepo }) => {
              setSelectedOrg(selectedOrg)
              setSelectedRepo(selectedRepo)
            }}
            onOnboardingSkip={() => {
              skipOnboarding()
              mutate(formData)
            }}
          />
        ) : (
          <UserOnboardingForm
            currentUser={currentUser}
            onFormSubmit={(formData) =>
              onboardingOrganizationSelector
                ? setFormData(formData)
                : mutate(formData)
            }
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
