import { useState } from 'react'

import { useRepoSettings } from 'services/repo'
import Button from 'ui/Button'

import DeactivateRepoModal from './DeactivateRepoModal'
import { useRepoActivation } from './hooks'

const ActivationStatus = Object.freeze({
  DEACTIVATED: { TITLE: 'Repo has been deactivated', LABEL: 'Activate' },
  ACTIVATED: { TITLE: 'Deactivate repo', LABEL: 'Deactivate' },
})

function RepoState() {
  const { data } = useRepoSettings()
  const [showModal, setShowModal] = useState(false)
  const { toggleRepoState, isLoading } = useRepoActivation()

  const activated = data?.repository?.activated

  if (activated) {
    return (
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">{ActivationStatus.ACTIVATED.TITLE}</h2>
          <p>This will prevent any further uploads</p>
        </div>
        <div>
          <Button
            variant="danger"
            hook="deactivate-repo"
            onClick={() => setShowModal(true)}
            disabled={isLoading}
          >
            {ActivationStatus.ACTIVATED.LABEL}
          </Button>
          <DeactivateRepoModal
            showModal={showModal}
            closeModal={() => setShowModal(false)}
            deactivateRepo={toggleRepoState}
            isLoading={isLoading}
            activated={activated}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-between">
      <h2 className="font-semibold">{ActivationStatus.DEACTIVATED.TITLE}</h2>
      <div>
        <Button
          variant="primary"
          hook="activate-repo"
          onClick={() => toggleRepoState(activated)}
          disabled={isLoading}
        >
          {ActivationStatus.DEACTIVATED.LABEL}
        </Button>
      </div>
    </div>
  )
}

export default RepoState
