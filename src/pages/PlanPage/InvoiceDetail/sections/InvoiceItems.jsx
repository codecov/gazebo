import { fromUnixTime } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import PropTypes from 'prop-types'

function formatPeriod(period) {
  if (period.start === period.end) return null

  const start = format(
    utcToZonedTime(fromUnixTime(period.start), 'UTC'),
    'MMMM do yyyy',
    { timeZone: 'UTC' }
  )
  const end = format(
    utcToZonedTime(fromUnixTime(period.end), 'UTC'),
    'MMMM do yyyy',
    { timeZone: 'UTC' }
  )

  return ` - Period from ${start} to ${end}`
}

function InvoiceItems({ invoice }) {
  return (
    <div>
      <h4 className="text-lg bold">Description</h4>
      {invoice.lineItems.map((line, i) => (
        <div key={i} className="flex mt-4 ">
          <p className="text-gray-800">
            ({line.quantity}) {line.planName} {formatPeriod(line.period)}
            {line.description && (
              <>
                <br />
                {line.description}
              </>
            )}
          </p>
          <span className="ml-auto text-lg text-gray-800">
            ${(line.amount / 100).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}

InvoiceItems.propTypes = {
  invoice: PropTypes.shape({
    lineItems: PropTypes.arrayOf(
      PropTypes.shape({
        quantity: PropTypes.number.isRequired,
        amount: PropTypes.number.isRequired,
        description: PropTypes.string,
        planName: PropTypes.string,
        period: PropTypes.shape({
          start: PropTypes.number,
          end: PropTypes.number,
        }).isRequired,
      })
    ).isRequired,
  }).isRequired,
}

export default InvoiceItems
