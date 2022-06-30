import { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import Button from 'ui/Button'

import DeactivateRepoModal from './DeactiveRepoModal'
import useRepoActivation from './useRepoActivation'

import { ActivationStatusContext } from '../../Context'

const ActivationStatus = Object.freeze({
  DEACTIVATED: { TITLE: 'Repo has been deactivated', LABEL: 'Activate' },
  ACTIVATED: { TITLE: 'Deactivate repo', LABEL: 'Deactivate' },
})

function RepoState() {
  const { owner, repo, provider } = useParams()
  const { refetch } = useRepo({
    provider,
    owner,
    repo,
  })

  const [showModal, setShowModal] = useState(false)
  const {
    toggleRepoState,
    isLoading,
    data: updatedRepoData,
  } = useRepoActivation()

  const repoActivationStatus = useContext(ActivationStatusContext)
  const activated = updatedRepoData?.activated
    ? updatedRepoData?.activated
    : repoActivationStatus

  const handleRepoStateToggle = async (state) => {
    await toggleRepoState(state)
    setTimeout(() => {
      refetch()
    }, 100)
  }

  return activated ? (
    <div className="flex">
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
            deactivateRepo={handleRepoStateToggle}
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
          onClick={() => handleRepoStateToggle(activated)}
          disabled={isLoading}
        >
          {ActivationStatus.DEACTIVATED.LABEL}
        </Button>
      </div>
    </div>
  )
}

export default RepoState
