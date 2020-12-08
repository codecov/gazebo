import Card from 'ui/Card'
import { accountDetailsPropType } from 'services/account'

function PaymentCard({ accountDetails }) {
  return (
    <Card className="mt-4 p-6">
      <pre>{JSON.stringify(accountDetails.paymentMethod, null, 2)}</pre>
    </Card>
  )
}

PaymentCard.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

export default PaymentCard
