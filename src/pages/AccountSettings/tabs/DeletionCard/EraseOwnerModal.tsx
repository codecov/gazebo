import { type ChangeEvent, useState } from 'react'

import Button from 'ui/Button'
import Modal from 'ui/Modal'
import TextInput from 'ui/TextInput'

interface EraseOwnerModalProps {
  isPersonalSettings: boolean
  ownerName: string
  isLoading: boolean
  showModal: boolean
  closeModal: () => void
  eraseOwner: () => void
}

function EraseOwnerModal({
  isPersonalSettings,
  ownerName,
  closeModal,
  eraseOwner,
  isLoading,
  showModal,
}: EraseOwnerModalProps) {
  const [confirmationText, setConfirmationText] = useState('')

  const entity = isPersonalSettings ? 'personal account' : 'organization'
  const title = isPersonalSettings
    ? 'Delete personal account'
    : 'Delete organization'
  const isConfirmed = confirmationText === ownerName

  const handleClose = () => {
    setConfirmationText('')
    closeModal()
  }

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title={title}
      size="small"
      body={
        <div className="flex flex-col gap-4">
          <div className="rounded border border-ds-primary-red bg-ds-primary-red/5 p-4 text-ds-gray-octonary">
            <p className="font-semibold text-ds-primary-red">
              Warning: this action is not reversible.
            </p>
            <p className="mt-2">
              Deleting the{' '}
              <span className="font-semibold">{ownerName}</span> {entity} will
              permanently erase all of its repositories and their contents,
              along with all associated tokens, uploads, and settings. Once
              deleted, this data cannot be recovered.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p>
              To confirm, type{' '}
              <span className="font-semibold">{ownerName}</span> in the box
              below.
            </p>
            <TextInput
              dataMarketing="erase-owner-confirmation"
              placeholder={ownerName}
              value={confirmationText}
              autoComplete="off"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmationText(e.target.value)
              }
            />
          </div>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button hook="close-modal" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            hook="erase-owner-content"
            variant="danger"
            isLoading={isLoading}
            disabled={!isConfirmed}
            onClick={() => eraseOwner()}
          >
            {title}
          </Button>
        </div>
      }
    />
  )
}

export default EraseOwnerModal
