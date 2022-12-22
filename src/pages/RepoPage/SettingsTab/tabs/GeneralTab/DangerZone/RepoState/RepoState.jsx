import { useState } from 'react'

import { useRepoSettings } from 'services/repo'
import Button from 'ui/Button'

import DeactivateRepoModal from './DeactiveRepoModal'
import useRepoActivation from './useRepoActivation'

const ActivationStatus = Object.freeze({
  DEACTIVATED: { TITLE: 'Repo has been deactivated', LABEL: 'Activate' },
  ACTIVATED: { TITLE: 'Deactivate repo', LABEL: 'Deactivate' },
})

function RepoState() {
  const { data } = useRepoSettings()
  const repository = data?.repository
  const [showModal, setShowModal] = useState(false)
  const { toggleRepoState, isLoading } = useRepoActivation()

  const activated = repository?.activated

  return activated ? (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex flex-col flex-1 gap-1">
        <h2 className="font-semibold">{ActivationStatus.ACTIVATED.TITLE}</h2>
        <p>This will prevent any further uploads</p>
      </div>
      <div>
        <Button
          variant="danger"
          hook="show-modal"
          onClick={() => setShowModal(true)}
          disabled={isLoading}
        >
          {ActivationStatus.ACTIVATED.LABEL}
        </Button>
        {showModal && (
          <DeactivateRepoModal
            closeModal={() => setShowModal(false)}
            deactivateRepo={toggleRepoState}
            isLoading={isLoading}
            activated={activated}
          />
        )}
      </div>
    </div>
  ) : (
    <div className="flex">
      <div className="flex flex-col flex-1 gap-1">
        <h2 className="font-semibold">{ActivationStatus.DEACTIVATED.TITLE}</h2>
      </div>
      <div>
        <Button
          variant="primary"
          hook="update-repo"
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
