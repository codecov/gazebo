import { useState } from 'react'

import { useEraseRepo } from 'services/repo'
import Button from 'ui/Button'

import EraseRepoModal from './EraseRepoModal'

interface EraseRepoButtonProps {
  isLoading: boolean
  setShowModal: (show: boolean) => void
}

function EraseRepoButton({ isLoading, setShowModal }: EraseRepoButtonProps) {
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
      Erase Repository
    </Button>
  )
}

function EraseRepo() {
  const [showModal, setShowModal] = useState(false)
  const { mutate: eraseRepo, isLoading } = useEraseRepo()

  return (
    <div className="flex flex-col sm:flex-row">
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="font-semibold">Erase repository</h2>
        <p className="max-w-md">
          This will erase the repository, including all of its contents. The
          repository will be recreated when resyncing the organization contents.
        </p>
      </div>
      <div>
        <EraseRepoButton isLoading={isLoading} setShowModal={setShowModal} />
        <EraseRepoModal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          eraseRepo={eraseRepo}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default EraseRepo
