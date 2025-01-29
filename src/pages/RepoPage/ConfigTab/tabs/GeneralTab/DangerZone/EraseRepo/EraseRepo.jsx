import PropTypes from 'prop-types'
import { useState } from 'react'

import { useEraseRepo } from 'services/repo'
import Button from 'ui/Button'

import EraseRepoModal from './EraseRepoModal'

function EraseRepoButton({ isLoading, setShowModal }) {
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

EraseRepoButton.propTypes = {
  setShowModal: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
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
          repository itself will be re-created when resync-ing the organization
          contents.
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
