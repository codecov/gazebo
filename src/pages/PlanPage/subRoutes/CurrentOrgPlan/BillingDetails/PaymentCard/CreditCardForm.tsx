import { CardElement, useElements } from '@stripe/react-stripe-js'
import cs from 'classnames'
import { useState } from 'react'

import { useUpdateCard } from 'services/account'
import Button from 'ui/Button'

interface CreditCardFormProps {
  closeForm: () => void
  provider: string
  owner: string
}

function CreditCardForm({ closeForm, provider, owner }: CreditCardFormProps) {
  const [errorState, setErrorState] = useState('')

  const elements = useElements()
  const {
    mutate: updateCard,
    isLoading,
    error,
    reset,
  } = useUpdateCard({
    provider,
    owner,
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()

    if (!elements) {
      return null
    }

    updateCard(elements.getElement(CardElement), {
      onSuccess: closeForm,
    })
  }

  const showError = (error && !reset) || errorState

  return (
    <form onSubmit={submit} aria-label="form">
      <div className={cs('flex flex-col gap-3')}>
        <div className="mt-2 flex flex-col gap-2">
          <CardElement
            onChange={(e) => setErrorState(e.error?.message || '')}
            options={{
              disableLink: true,
              hidePostalCode: true,
              classes: {
                empty: 'rounded border-ds-gray-tertiary border-2',
                focus: 'rounded !border-ds-blue-darker border-4',
                base: 'px-4 py-3',
                invalid: 'rounded !border-ds-primary-red border-4',
              },
            }}
          />
          <p className="mt-1 text-ds-primary-red">
            {showError && (error?.message || errorState)}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            hook="update-payment"
            type="submit"
            variant="primary"
            disabled={isLoading}
            to={''}
          >
            Update
          </Button>
          <Button
            type="button"
            hook="cancel-payment"
            variant="plain"
            disabled={isLoading}
            onClick={closeForm}
            to={''}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}

export default CreditCardForm
