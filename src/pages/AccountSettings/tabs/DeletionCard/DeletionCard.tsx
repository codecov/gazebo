import { useState } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'old_ui/Card'
import { useEraseAccount } from 'services/account'
import Button from 'ui/Button'

import EraseOwnerModal from './EraseOwnerModal'

interface DeletionCardProps {
  isPersonalSettings: boolean
}

interface EraseOwnerButtonProps {
  isPersonalSettings: boolean
  isLoading: boolean
  setShowModal: (_: boolean) => void
}

function EraseOwnerButton({
  isPersonalSettings,
  isLoading,
  setShowModal,
}: EraseOwnerButtonProps) {
  const button = isPersonalSettings
    ? 'Erase Personal Account'
    : 'Erase Organization'

  if (isLoading) {
    return (
      <div className="font-light italic">
        processing erase, this may take a while
      </div>
    )
  }

  return (
    <Button
      variant="danger"
      hook="show-modal"
      onClick={() => setShowModal(true)}
    >
      {button}
    </Button>
  )
}

interface URLParams {
  provider?: string
  owner?: string
}

function DeletionCard({ isPersonalSettings }: DeletionCardProps) {
  const { provider, owner } = useParams<URLParams>()
  const [showModal, setShowModal] = useState(false)
  const { mutate: eraseOwner, isLoading } = useEraseAccount({ provider, owner })

  const title = isPersonalSettings ? 'Delete account' : 'Delete organization'
  const text = isPersonalSettings
    ? 'Erase my personal account and all my repositories.'
    : 'Erase organization and all its repositories.'

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Card className="flex flex-col sm:flex-row">
        <div className="flex flex-1 flex-col gap-1">
          <p> {text} </p>
        </div>
        <div>
          <EraseOwnerButton
            isPersonalSettings={isPersonalSettings}
            isLoading={isLoading}
            setShowModal={setShowModal}
          />
          <EraseOwnerModal
            isPersonalSettings={isPersonalSettings}
            isLoading={isLoading}
            showModal={showModal}
            closeModal={() => setShowModal(false)}
            eraseOwner={eraseOwner}
          />
        </div>
      </Card>
    </div>
  )
}

export default DeletionCard
