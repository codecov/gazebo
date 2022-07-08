import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
} from '@stripe/react-stripe-js'
import cs from 'classnames'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { useUpdateCard } from 'services/account'
import Button from 'ui/Button'
import Spinner from 'ui/Spinner'

function useIsFormReady() {
  // Stripe fields takes a couple of second to appear
  // so we wait for all of them to be ready before displaying
  // the form; and we show a spinner in the mean time
  const [fields, setFields] = useState({
    number: false,
    expiry: false,
    cvc: false,
  })
  const isReady = Object.values(fields).every(Boolean)

  function setFieldReady(name) {
    setFields((prevState) => ({
      ...prevState,
      [name]: true,
    }))
  }

  return [isReady, setFieldReady]
}

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
  const [isReady, setFieldReady] = useIsFormReady()

  function submit(e) {
    e.preventDefault()
    updateCard(elements.getElement(CardNumberElement), {
      onSuccess: closeForm,
    })
  }

  const inputClass = 'bg-ds-gray-primary py-3 px-4 rounded-full '
  const resetError = error && reset

  return (
    <form onSubmit={submit} className="mt-4" aria-label="form">
      <div className={cs('flex flex-col gap-5', { hidden: !isReady })}>
        <div className="flex flex-col gap-2">
          <CardNumberElement
            onChange={resetError}
            className={inputClass}
            onReady={() => setFieldReady('number')}
          />
          <div className="flex gap-2">
            <CardExpiryElement
              onChange={resetError}
              className={cs(inputClass, 'w-1/2 mr-2')}
              onReady={() => setFieldReady('expiry')}
            />
            <CardCvcElement
              onChange={resetError}
              className={cs(inputClass, 'w-1/2 ml-2')}
              onReady={() => setFieldReady('cvc')}
            />
          </div>
          {error && (
            <p className="bg-ds-error-quinary text-ds-error-nonary p-3 mt-4 rounded-md">
              {error.data.detail}
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
            variant="plain"
            disabled={isLoading}
            onClick={closeForm}
          >
            Cancel
          </Button>
        </div>
      </div>
      <div className={cs('flex justify-center mt-8', { hidden: isReady })}>
        <Spinner />
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
