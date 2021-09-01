import Header from './Header'
import NotFound from 'pages/NotFound'
import Tabs from './Tabs'
import { orderingOptions, nonActiveOrderingOptions } from 'services/repos'
import { useLocationParams } from 'services/navigation'
import ReposTable from 'shared/ListRepo/ReposTable'
import { useParams } from 'react-router-dom'
import { useOwner } from 'services/user'

const defaultQueryParams = {
  search: '',
  ordering: orderingOptions[0]['ordering'],
  direction: orderingOptions[0]['direction'],
}

function AnalyticsPage() {
  const { params } = useLocationParams(defaultQueryParams)
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  const orderOptions = nonActiveOrderingOptions

  const sortItem =
    orderOptions.find(
      (option) =>
        option.ordering === params.ordering &&
        option.direction === params.direction
    ) || orderOptions[0]

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4">
      <Header owner={ownerData} />
      <div>{ownerData?.isCurrentUserPartOfOrg && <Tabs />}</div>
      <ReposTable
        owner={owner}
        active={true}
        sortItem={sortItem}
        searchValue={params.search}
      />
    </div>
  )
}

export default AnalyticsPage
