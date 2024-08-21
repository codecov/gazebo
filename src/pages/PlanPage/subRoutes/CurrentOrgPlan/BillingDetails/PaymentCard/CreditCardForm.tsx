import { CardElement, useElements } from '@stripe/react-stripe-js'
import cs from 'classnames'
import { useEffect, useState } from 'react'

import { useUpdateCard } from 'services/account'
import Button from 'ui/Button'

interface CreditCardFormProps {
  closeForm: () => void
  provider: string
  owner: string
}

function CreditCardForm({ closeForm, provider, owner }: CreditCardFormProps) {
  const [errorState, setErrorState] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains('dark')
  )

  // Function to update the style based on the dark mode status
  const getStyle = () => {
    return {
      base: {
        borderColor: isDarkMode ? 'rgb(47,51,60)' : 'rgb(216,220,226)', // Same values as --color-ds-gray-tertiary.
        color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
      },
    }
  }

  // MutationObserver to track the dark mode class change
  useEffect(() => {
    const updateAppearance = () => {
      setIsDarkMode(document.body.classList.contains('dark'))
    }

    const observer = new MutationObserver(updateAppearance)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Initial check on mount
    updateAppearance()

    // Cleanup the observer on component unmount
    return () => observer.disconnect()
  }, [])

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
              style: getStyle(),
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
