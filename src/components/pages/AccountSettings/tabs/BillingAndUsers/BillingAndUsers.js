import Card from 'components/Card'

function BillingAndUsers() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-start-1 col-end-4">
        <Card>Current plan</Card>
        <Card className="mt-4">Credit card information</Card>
        <Card className="mt-4">Latest invoice</Card>
      </div>
      <div className="col-start-4 col-end-13">
        <Card>Users</Card>
      </div>
    </div>
  )
}

export default BillingAndUsers
