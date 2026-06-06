import { useState } from 'react'

import Card from 'old_ui/Card'
import { useAddNotification } from 'services/toastNotification/context'
import { useRegenerateSupportPin, useUser } from 'services/user'
import Button from 'ui/Button'

import RegenerateSupportPinModal from './RegenerateSupportPinModal'

function SupportPinCard() {
  const [showModal, setShowModal] = useState(false)
  const addToast = useAddNotification()
  const { data: currentUser } = useUser()

  const { mutateAsync, isLoading } = useRegenerateSupportPin({
    onSuccess: () => {
      addToast({
        type: 'success',
        text: 'Support PIN successfully regenerated',
      })
    },
  })

  const supportPin = currentUser?.supportPin

  return (
    <Card variant="old" className="p-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Support PIN</h1>
          <Button
            hook="regenerate-support-pin"
            disabled={isLoading}
            onClick={() => setShowModal(true)}
          >
            Regenerate
          </Button>
        </div>
        <p>
          Provide this PIN to a Codecov support agent to verify your identity.
          Never share it with anyone else.
        </p>
        <span
          className="font-mono text-2xl tracking-[0.5em]"
          data-testid="support-pin-value"
        >
          {supportPin ?? '------'}
        </span>
      </div>
      {showModal && (
        <RegenerateSupportPinModal
          closeModal={() => setShowModal(false)}
          regeneratePin={mutateAsync}
          isLoading={isLoading}
        />
      )}
    </Card>
  )
}

export default SupportPinCard
