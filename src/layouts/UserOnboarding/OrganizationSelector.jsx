import noop from 'lodash/noop'
import PropTypes from 'prop-types'
import { Suspense, useState } from 'react'

import A from 'ui/A'
import BaseModal from 'ui/Modal/BaseModal'
import Spinner from 'ui/Spinner'

import OrganizationsList from './OrganizationsList'
import { useOnboardingTracking } from './useOnboardingTracking'

const loadingState = (
  <div className="flex justify-center py-8">
    <Spinner />
  </div>
)

const getOrgStepProps = ({
  isHelpFindingOrg,
  handleOrgSubmit,
  setIsHelpFindingOrg,
  onOnboardingSkip,
  helpFindingOrganization,
}) => ({
  title: isHelpFindingOrg
    ? "Don't see your organization?"
    : 'Select organization',
  subtitle: isHelpFindingOrg ? (
    <span>
      Your organization may need to grant access&nbsp;
      <A
        hook="oauth-troubleshoot"
        to={{ pageName: 'oauthTroubleshoot' }}
        className="pl-2"
        isExternal
      >
        learn more
      </A>
    </span>
  ) : (
    'This will help improve your experience'
  ),
  body: (
    <Suspense fallback={loadingState}>
      <OrganizationsList
        onSubmit={handleOrgSubmit}
        isHelpFindingOrg={isHelpFindingOrg}
        setIsHelpFindingOrg={setIsHelpFindingOrg}
      />
    </Suspense>
  ),
  footer: isHelpFindingOrg ? (
    <div className="flex flex-1 justify-between">
      <button onClick={() => setIsHelpFindingOrg(false)}>Back</button>
      <button onClick={onOnboardingSkip}>Skip &gt;</button>
    </div>
  ) : (
    <div className="flex flex-1 justify-between">
      <span>
        Don&apos;t see your org?
        <button
          className="pl-2 text-blue-400"
          onClick={() => {
            helpFindingOrganization()
            setIsHelpFindingOrg(true)
          }}
        >
          Help finding org &gt;
        </button>
      </span>
      <button onClick={onOnboardingSkip}>Skip &gt;</button>
    </div>
  ),
})

function usePerStepProp({ onSelect, onOnboardingSkip, currentUser }) {
  const { helpFindingOrganization, selectOrganization } =
    useOnboardingTracking()

  const [isHelpFindingOrg, setIsHelpFindingOrg] = useState(false)

  const handleOrgSubmit = (org) => {
    selectOrganization(currentUser, org.username)
    onSelect({ selectedOrg: org })
  }
  return getOrgStepProps({
    isHelpFindingOrg,
    handleOrgSubmit,
    setIsHelpFindingOrg,
    onOnboardingSkip,
    helpFindingOrganization,
  })
}

function OrganizationSelector({ onSelect, onOnboardingSkip, currentUser }) {
  const stepProps = usePerStepProp({
    onSelect,
    onOnboardingSkip,
    currentUser,
  })

  return <BaseModal hasCloseButton={false} onClose={noop} {...stepProps} />
}

OrganizationSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onOnboardingSkip: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string,
  }).isRequired,
}

export default OrganizationSelector
