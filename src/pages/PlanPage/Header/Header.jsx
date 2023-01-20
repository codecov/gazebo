import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { usePlanPageData } from 'pages/PlanPage/hooks'

function Header() {
  const { owner } = useParams()
  const { data: ownerData } = usePlanPageData({ username: owner })

  return (
    <MyContextSwitcher pageName="planTab" activeContext={ownerData?.username} />
  )
}

export default Header
