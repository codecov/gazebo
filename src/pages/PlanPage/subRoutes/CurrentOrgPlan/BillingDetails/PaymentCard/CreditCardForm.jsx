import { CardElement, useElements } from '@stripe/react-stripe-js'
import cs from 'classnames'
import PropTypes from 'prop-types'

import { useUpdateCard } from 'services/account'
import Button from 'ui/Button'

function CreditCardForm({ closeForm, provider, owner }) {
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

  function submit(e) {
    e.preventDefault()
    updateCard(elements.getElement(CardElement), {
      onSuccess: closeForm,
    })
  }

  const resetError = error && reset

  return (
    <form onSubmit={submit} aria-label="form">
      <div className={cs('flex flex-col gap-3')}>
        <div className="mt-2 flex flex-col gap-2">
          <CardElement
            onChange={resetError}
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
          <p className="mt-1 text-ds-primary-red">{error && error.message}</p>
        </div>
        <div className="flex gap-1">
          <Button
            hook="update-payment"
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            Update
          </Button>
          <Button
            type="button"
            hook="cancel-payment"
            variant="plain"
            disabled={isLoading}
            onClick={closeForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}

CreditCardForm.propTypes = {
  closeForm: PropTypes.func.isRequired,
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default CreditCardForm
