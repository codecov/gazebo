import PropType from 'prop-types'
import { useHistory } from 'react-router-dom'

import Button from 'components/Button'
import { useCancelPlan, accountDetailsPropType } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

function DowngradeToFree({ accountDetails, provider, owner }) {
  const redirect = useHistory().push
  const addToast = useAddNotification()
  const [cancelPlan, { isLoading }] = useCancelPlan({
    provider,
    owner,
    onSuccess: () => {
      addToast({
        type: 'success',
        text: 'Successfully downgraded to: Free Plan',
      })
      redirect(`/account/${provider}/${owner}`)
    },
    onError: () =>
      addToast({
        type: 'error',
        text: 'Something went wrong',
      }),
    useErrorBoundary: false,
  })

  const isAlreadyFreeUser = accountDetails.plan?.value === 'users-free'
  const isDisabled = isLoading || isAlreadyFreeUser

  return (
    <Button color="red" onClick={cancelPlan} disabled={isDisabled}>
      Downgrade to Free
    </Button>
  )
}

DowngradeToFree.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
  accountDetails: accountDetailsPropType.isRequired,
}

export default DowngradeToFree
