import { CardElement, useElements } from '@stripe/react-stripe-js'
import cs from 'classnames'
import { useState } from 'react'

import { useUpdateCard } from 'services/account'
import { Theme, useThemeContext } from 'shared/ThemeContext'
import Button from 'ui/Button'

interface CreditCardFormProps {
  closeForm: () => void
  provider: string
  owner: string
}

function CreditCardForm({ closeForm, provider, owner }: CreditCardFormProps) {
  const [errorState, setErrorState] = useState('')
  const { theme } = useThemeContext()
  const isDarkMode = theme === Theme.DARK

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
                empty:
                  'rounded border-ds-gray-tertiary border-2 bg-ds-container',
                focus:
                  'rounded !border-ds-blue-darker border-4 bg-ds-container',
                base: 'px-4 py-3 bg-ds-container',
                invalid:
                  'rounded !border-ds-primary-red border-4 bg-ds-container',
              },
              style: {
                base: {
                  color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
                },
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
            to={undefined}
          >
            Update
          </Button>
          <Button
            type="button"
            hook="cancel-payment"
            variant="plain"
            disabled={isLoading}
            onClick={closeForm}
            to={undefined}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}

export default CreditCardForm
