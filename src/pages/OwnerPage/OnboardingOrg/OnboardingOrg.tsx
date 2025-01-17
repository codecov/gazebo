import { useState } from 'react'

import orgListInstallApp from 'assets/onboarding/org_list_install_app.png'
import AppInstallModal from 'shared/AppInstallModal'
import Button from 'ui/Button'

import { LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER } from './constants'

import { useOnboardingContainer } from '../OnboardingContainerContext/context'

function OnboardingOrg() {
  const { showOnboardingContainer, setShowOnboardingContainer } =
    useOnboardingContainer()

  const dismiss = () => {
    setShowOnboardingContainer(!showOnboardingContainer)
    localStorage.setItem(
      LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER,
      !showOnboardingContainer ? 'false' : 'true'
    )
  }

  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="mb-6 border border-ds-gray-primary">
        <div className="flex items-center justify-between bg-ds-gray-primary px-6 py-4">
          <div className="font-semibold">
            How to integrate another organization to Codecov
          </div>
          <Button onClick={dismiss} hook="dismiss-onboarding-org">
            <span>Dismiss</span>
          </Button>
        </div>
        <div className="flex items-center justify-center gap-6 py-8">
          <div className="h-[107px] w-[169px]">
            <img
              alt="GitHub Organization Install List Example"
              className="h-full object-cover"
              src={orgListInstallApp}
            />
          </div>
          <div className="w-[350px] text-sm">
            <div className="font-semibold ">
              Add your GitHub Organization to Codecov
            </div>
            <div className="font-light">
              To get full access, you need to install the Codecov app on your
              GitHub organization. Admin required.
            </div>
            <div className="mt-2">
              <Button
                variant="primary"
                onClick={() => setShowModal(true)}
                hook="install-codecov-link"
              >
                <span>Install Codecov</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AppInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplete={() => setShowModal(false)}
      />
    </>
  )
}

export default OnboardingOrg
