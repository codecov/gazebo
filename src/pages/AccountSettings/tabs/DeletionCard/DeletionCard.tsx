import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account/useAccountDetails'
import { useEraseAccount } from 'services/account/useEraseAccount'
import { useOwner } from 'services/user'
import { type Provider } from 'shared/api/helpers'
import { CollectionMethods } from 'shared/utils/billing'
import A from 'ui/A'
import Button from 'ui/Button'

import EraseOwnerModal from './EraseOwnerModal'

interface DeletionCardProps {
  isPersonalSettings: boolean
}

interface URLParams {
  provider: Provider
  owner: string
}

function DeletionCard({ isPersonalSettings }: DeletionCardProps) {
  const { provider, owner } = useParams<URLParams>()
  const [showModal, setShowModal] = useState(false)
  const { data: accountDetails, isLoading: isLoadingAccountDetails } =
    useAccountDetails({ provider, owner })
  const { data: ownerData, isLoading: isLoadingOwner } = useOwner({
    username: owner,
    opts: { enabled: !isPersonalSettings },
  })
  const { mutate: eraseOwner, isLoading: isDeleting } = useEraseAccount({
    provider,
    owner,
  })

  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
      CollectionMethods.INVOICED_CUSTOMER_METHOD || accountDetails?.usesInvoice

  const title = isPersonalSettings ? 'Delete account' : 'Delete organization'
  const description = isPersonalSettings
    ? 'Erase my personal account and all my repositories. '
    : 'Erase organization and all its repositories. '
  const buttonLabel = isPersonalSettings
    ? 'Delete personal account'
    : 'Delete organization'

  if (isLoadingAccountDetails || (!isPersonalSettings && isLoadingOwner)) {
    return null
  }

  if (!isPersonalSettings && !ownerData?.isAdmin) {
    return null
  }

  if (isInvoicedCustomer) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="rounded border border-ds-gray-secondary bg-ds-container p-4">
          <p>
            {description}
            <A
              to={{ pageName: 'support' }}
              hook="contact-support-link"
              isExternal
            >
              Contact support
            </A>{' '}
            to request account deletion.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ds-primary-red">{title}</h2>
      <div className="rounded border border-ds-primary-red bg-ds-primary-red/5 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {description}
            <span className="font-semibold">This action is irreversible.</span>
          </p>
          <div>
            <Button
              variant="danger"
              hook="show-deletion-modal"
              disabled={isDeleting}
              onClick={() => setShowModal(true)}
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      </div>
      <EraseOwnerModal
        isPersonalSettings={isPersonalSettings}
        ownerName={owner}
        isLoading={isDeleting}
        showModal={showModal}
        closeModal={() => setShowModal(false)}
        eraseOwner={eraseOwner}
      />
    </div>
  )
}

export default DeletionCard
