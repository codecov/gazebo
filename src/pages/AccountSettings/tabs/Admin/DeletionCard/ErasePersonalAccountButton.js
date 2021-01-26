import { useState } from 'react'

import Button from 'ui/Button'
import Modal from 'ui/Modal'

function ErasePersonalAccountButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button color="red" onClick={() => setIsModalOpen(true)}>
        Erase account
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Are you sure?"
      >
        <p className="text-sm">Erasing your account will:</p>
        <ul className="mt-4 list-disc pl-4 text-sm">
          <li>
            This will delete all your session data, oauth token, email and other
            personal data
          </li>
          <li>This will delete all your personal repositories</li>
          <li>This will NOT touch organization information</li>
        </ul>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
          <Button color="red" onClick={() => setIsModalOpen(false)}>
            Erase my account
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default ErasePersonalAccountButton
