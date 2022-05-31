import PropTypes from 'prop-types'
import { useState } from "react";

import { useEraseRepoContent } from "services/repo";
import { useAddNotification } from 'services/toastNotification'
import Button from "ui/Button";
import Modal from 'ui/Modal'

const EraseRepoContenModal = ({ closeModal, eraseRepoContent, isLoading }) => (
    <Modal
        isOpen={true}
        onClose={closeModal}
        title="Are you sure you want to erase the repo coverage content?"
        body={
            <p>This will erase repo coverage content should erase all coverage data contained in the repo. This action is irreversible and if you proceed, you will permanently erase any historical code coverage in Codecov for this repository.</p>
        }
        footer={
            <div className="flex gap-2">
                <div>
                    <Button hook="close-modal" onClick={closeModal}>
                        Cancel
                    </Button>
                </div>
                <div>
                    <Button
                        isLoading={isLoading}
                        hook="erase-repo-content"
                        variant="danger"
                        onClick={async () => {
                            await eraseRepoContent()
                            closeModal()
                        }}
                    >
                        Erase Content
                    </Button>
                </div>
            </div>
        }
    />
)

EraseRepoContenModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    eraseRepoContent: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired
}

function useEraseContent() {
    const addToast = useAddNotification()
    const { mutate, ...rest } = useEraseRepoContent()

    async function eraseRepoContent() {
        mutate(null, {
            onError: () =>
                addToast({
                    type: 'error',
                    text: 'We were not able to erase this repo\'s content',
                }),
        })
    }

    return { eraseRepoContent, ...rest }
}

function EraseRepoContent() {
    const [showModal, setShowModal] = useState(false)
    const { eraseRepoContent, isLoading } = useEraseContent()

    return <div className="flex">
        <div className="flex flex-col flex-1 gap-1">
            <h2 className="font-semibold">Erase repo coverage content</h2>
            <p>This will remove all coverage reporting from the repo</p>
        </div>
        <div>
            <Button
                variant="danger"
                hook="show-modal"
                onClick={() => setShowModal(true)}
                disabled={isLoading}>
                Erase Content
            </Button>
            {showModal && (
                <EraseRepoContenModal
                    closeModal={() => setShowModal(false)}
                    eraseRepoContent={eraseRepoContent}
                    isLoading={isLoading}
                />
            )}
        </div>
    </div>
}


export default EraseRepoContent;