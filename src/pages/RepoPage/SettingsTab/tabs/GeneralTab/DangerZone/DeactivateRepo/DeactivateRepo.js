import { useContext, useState } from 'react'

import { useUpdateRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'
import Button from 'ui/Button'

import DeactivateRepoModal from './DeactiveRepoModal'

import { ActivationStatusContext } from '../../Context'

const ActivationStatus = Object.freeze({
  DEACTIVATED: { TITLE: 'Activate repo', LABEL: 'Activate' },
  ACTIVATED: { TITLE: 'Deactivate repo', LABEL: 'Deactivate' },
})

function useRepoActivation() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpdateRepo()

  async function activateOrDeactivateRepo(active) {
    mutate(
      {
        active: !active,
        activated: !active,
      },
      {
        onError: () =>
          addToast({
            type: 'error',
            text: `We were not able to ${
              active ? 'deactivate' : 'activate'
            } this repo`,
          }),
      }
    )
  }

  return { activateOrDeactivateRepo, ...rest }
}

function DeactivateRepo() {
  const [showModal, setShowModal] = useState(false)
  const { activateOrDeactivateRepo, isLoading, data } = useRepoActivation()
  const active = useContext(ActivationStatusContext)
  const activated = data?.active !== undefined ? data.active : active

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
            deactivateRepo={activateOrDeactivateRepo}
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
          onClick={() => activateOrDeactivateRepo(activated)}
          disabled={isLoading}
        >
          {ActivationStatus.DEACTIVATED.LABEL}
        </Button>
      </div>
    </div>
  )
}

export default DeactivateRepo
