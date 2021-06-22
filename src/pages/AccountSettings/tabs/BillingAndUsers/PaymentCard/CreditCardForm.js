import PropTypes from 'prop-types'
import { useState } from 'react'
import cs from 'classnames'
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
} from '@stripe/react-stripe-js'

import { useUpdateCard } from 'services/account'
import Button from 'old_ui/Button'
import LogoSpinner from 'old_ui/LogoSpinner'

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

  const inputClass = 'bg-gray-100 py-3 px-4 rounded-full '
  const resetError = error && reset

  return (
    <form onSubmit={submit} className="mt-4" aria-label="form">
      <div className={cs({ hidden: !isReady })}>
        <CardNumberElement
          onChange={resetError}
          className={inputClass}
          onReady={() => setFieldReady('number')}
        />
        <div className="flex mt-2">
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
          <p className="bg-error-500 text-error-900 p-3 mt-4 rounded-md">
            {error.data.detail}
          </p>
        )}
        <div className="flex justify-between mt-4">
          <Button
            type="button"
            color="gray"
            variant="outline"
            disabled={isLoading}
            onClick={closeForm}
          >
            Cancel
          </Button>
          <Button color="pink" type="submit" disabled={isLoading}>
            Save
          </Button>
        </div>
      </div>
      <div className={cs('mt-8', { hidden: isReady })}>
        <LogoSpinner size={50} />
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
