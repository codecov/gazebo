import { useState } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'old_ui/Card'
import { useEraseAccount } from 'services/account/useEraseAccount'
import { type Provider } from 'shared/api/helpers'
import Button from 'ui/Button'

import EraseOwnerModal from './EraseOwnerModal'

interface DeletionCardProps {
  isPersonalSettings: boolean
}

interface URLParams {
  provider: Provider
  owner: string
}

function DeletionCard({ isPersonalSettings }: DeletionCardProps) {
  const { provider, owner } = useParams<URLParams>()
  const [showModal, setShowModal] = useState(false)
  const { mutate: eraseOwner, isLoading } = useEraseAccount({ provider, owner })

  const title = isPersonalSettings ? 'Delete account' : 'Delete organization'
  const description = isPersonalSettings
    ? 'Erase my personal account and all my repositories. '
    : 'Erase organization and all its repositories. '
  const buttonLabel = isPersonalSettings
    ? 'Delete personal account'
    : 'Delete organization'

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {description}
            <span className="font-semibold">This action is irreversible.</span>
          </p>
          <div>
            <Button
              variant="danger"
              hook="show-deletion-modal"
              disabled={isLoading}
              onClick={() => setShowModal(true)}
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      </Card>
      <EraseOwnerModal
        isPersonalSettings={isPersonalSettings}
        ownerName={owner}
        isLoading={isLoading}
        showModal={showModal}
        closeModal={() => setShowModal(false)}
        eraseOwner={eraseOwner}
      />
    </div>
  )
}

export default DeletionCard
