import { useParams } from 'react-router-dom'
import useSummaryData from 'services/summary/hooks'

function Summary(page) {
  const params = useParams()
  const data = useSummaryData(page, params)

  return (
    <div className="flex gap-8 border-b border-ds-gray-secondary py-2">
      {data &&
        data.map((child) => {
          return child
        })}
    </div>
  )
}

export default Summary
