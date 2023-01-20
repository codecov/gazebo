import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import Avatar from 'ui/Avatar'

const HeaderBanners = lazy(() => import('./HeaderBanners/HeaderBanners'))

function Header() {
  const { owner } = useParams()
  const { data: ownerData } = useOwnerPageData({ username: owner })
  if (ownerData?.isCurrentUserPartOfOrg) {
    return (
      <>
        <Suspense fallback={null}>
          <HeaderBanners />
        </Suspense>
        <MyContextSwitcher
          pageName="owner"
          activeContext={ownerData?.username}
        />
      </>
    )
  }

  return (
    <div className="flex items-center">
      <Avatar user={ownerData} bordered />
      <h2 className="mx-2 text-xl font-semibold">{ownerData?.username}</h2>
    </div>
  )
}

export default Header
