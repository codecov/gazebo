import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { usePlanPageData } from 'pages/PlanPage/hooks'

function Header() {
  const { data: ownerData } = usePlanPageData()

  return (
    <MyContextSwitcher
      pageName="planTab"
      allOrgsPageName="allOrgsPlanPage"
      activeContext={ownerData?.username}
    />
  )
}

export default Header
