import Header from './Header'
import NotFound from 'pages/NotFound'
import Tabs from './Tabs'
import { useParams } from 'react-router-dom'
import { useOwner } from 'services/user'

function AnalyticsPage() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4">
      <Header owner={ownerData} />
      <div>{ownerData?.isCurrentUserPartOfOrg && <Tabs />}</div>
    </div>
  )
}

export default AnalyticsPage
