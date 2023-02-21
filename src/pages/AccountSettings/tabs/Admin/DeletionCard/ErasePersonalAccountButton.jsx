import PropTypes from 'prop-types'
import { useState } from 'react'

import Modal from 'old_ui/Modal'
import { useEraseAccount } from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import Button from 'ui/Button'

function ErasePersonalAccountButton({ provider, owner }) {
  const { mutate, isLoading } = useEraseAccount({ provider, owner })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const addToast = useAddNotification()

  function eraseAccount() {
    mutate(null, {
      onError: () =>
        addToast({
          type: 'error',
          text: 'Something went wrong',
        }),
    })
  }

  return (
    <>
      <Button
        hook="open modal to delete personal data"
        variant="danger"
        onClick={() => setIsModalOpen(true)}
      >
        Erase account
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Are you sure?"
      >
        <p>Erasing your account will:</p>
        <ul className="mt-4 list-disc pl-4">
          <li>
            This will delete all your session data, oauth token, email and other
            personal data
          </li>
          <li>This will delete all your personal repositories</li>
          <li>This will NOT touch organization information</li>
        </ul>
        <div className="mt-6 flex justify-between">
          <Button
            hook="cancel deleting personal data"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            hook="delete personal data"
            variant="danger"
            onClick={eraseAccount}
            disabled={isLoading}
          >
            Erase my account
          </Button>
        </div>
      </Modal>
    </>
  )
}

ErasePersonalAccountButton.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default ErasePersonalAccountButton
