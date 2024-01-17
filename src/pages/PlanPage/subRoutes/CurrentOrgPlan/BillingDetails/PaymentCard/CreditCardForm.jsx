import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
} from '@stripe/react-stripe-js'
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
    updateCard(elements.getElement(CardNumberElement), {
      onSuccess: closeForm,
    })
  }

  const inputClass = 'bg-ds-gray-primary py-3 px-4 rounded '
  const resetError = error && reset

  return (
    <form onSubmit={submit} aria-label="form">
      <div className={cs('flex flex-col gap-5')}>
        <div className="flex flex-col gap-2">
          <CardNumberElement onChange={resetError} className={inputClass} />
          <div className="flex gap-2">
            <CardExpiryElement
              onChange={resetError}
              className={cs(inputClass, 'w-1/2 mr-2')}
            />
            <CardCvcElement
              onChange={resetError}
              className={cs(inputClass, 'w-1/2 ml-2')}
            />
          </div>
          {error && (
            <p className="mt-4 rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
              {error?.data?.detail}
            </p>
          )}
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
