import { useState } from "react";

import { useEraseRepoContent } from "services/repo";
import { useAddNotification } from 'services/toastNotification'
import Button from "ui/Button";

import EraseRepoContenModal from "./EraseRepoContentModal";

function useEraseContent() {
    const addToast = useAddNotification()
    const { mutate, ...rest } = useEraseRepoContent()

    async function eraseRepoContent() {
        mutate(null, {
            onError: () =>
                addToast({
                    type: 'error',
                    text: 'We were unable to erase this repo\'s content',
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