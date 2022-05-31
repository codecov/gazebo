import PropTypes from 'prop-types'
import { useContext, useState } from "react";

import { useUpdateRepo } from "services/repo";
import { useAddNotification } from 'services/toastNotification'
import Button from "ui/Button";
import Modal from 'ui/Modal'

import { ActivationStatusContext } from '../../Context'

const ActivationStatus = Object.freeze({
    DEACTIVATED: { TITLE: 'Activate repo', LABEL: 'Activate' },
    ACTIVATED: { TITLE: 'Deactivate repo', LABEL: 'Deactivate' }
})

const DeactivateRepoModal = ({ closeModal, deactivateRepo, isLoading, activated }) => (
    <Modal
        isOpen={true}
        onClose={closeModal}
        title="Are you sure you want to deactivate the repo?"
        body={
            <p>Deactivate Repo will deactivate a repo and prevent the upload of coverage information to that repo going forward. You will be able to reactivate the repo at any time.</p>
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
                        hook="deactivate-repo"
                        variant="danger"
                        onClick={async () => {
                            await deactivateRepo(activated)
                            closeModal()
                        }}
                    >
                        Deactivate repo
                    </Button>
                </div>
            </div>
        }
    />
)

DeactivateRepoModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    deactivateRepo: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    activated: PropTypes.bool.isRequired
}

function useRepoActivation() {
    const addToast = useAddNotification()
    const { mutate, ...rest } = useUpdateRepo()

    async function activateOrDeactivateRepo(active) {
        mutate({
            active: !active,
            activated: !active
        }, {
            onError: () =>
                addToast({
                    type: 'error',
                    text: `We were not able to ${active ? ActivationStatus.ACTIVATED.LABEL : ActivationStatus.DEACTIVATED.LABEL} this repo`,
                }),
        })
    }

    return { activateOrDeactivateRepo, ...rest }
}

function DeactivateRepo() {
    const [showModal, setShowModal] = useState(false)
    const { activateOrDeactivateRepo, isLoading, data } = useRepoActivation()
    const active = useContext(ActivationStatusContext)
    const activated = data?.active !== undefined ? data.active : active

    return activated ?
        <div className="flex">
            < div className="flex flex-col flex-1 gap-1" >
                <h2 className="font-semibold">{ActivationStatus.ACTIVATED.TITLE}</h2>
                <p>This will prevent any further uploads </p>
            </div>
            <div>
                <Button
                    variant="danger"
                    hook="show-modal"
                    onClick={() => setShowModal(true)}
                    disabled={isLoading}>
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
        </div >
        :
        <div className="flex">
            < div className="flex flex-col flex-1 gap-1" >
                <h2 className="font-semibold">{ActivationStatus.DEACTIVATED.TITLE}</h2>
            </div >
            <div>
                <Button
                    variant="active"
                    hook="update-repo"
                    onClick={() => activateOrDeactivateRepo(activated)}
                    disabled={isLoading}>
                    {ActivationStatus.DEACTIVATED.LABEL}
                </Button>
            </div>
        </div >

}

export default DeactivateRepo;