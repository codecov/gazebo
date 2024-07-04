import { lazy, Suspense } from 'react'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import Avatar from 'ui/Avatar'

const HeaderBanners = lazy(() => import('./HeaderBanners/HeaderBanners'))

function Header() {
  const { data: ownerData } = useOwnerPageData()
  if (ownerData?.isCurrentUserPartOfOrg) {
    return (
      <>
        <Suspense fallback={null}>
          <HeaderBanners />
        </Suspense>
        <MyContextSwitcher pageName="owner" />
      </>
    )
  }

  return (
    <div className="flex items-center">
      <Avatar user={ownerData} border="light" />
      <h2 className="mx-2 text-xl font-semibold">{ownerData?.username}</h2>
    </div>
  )
}

export default Header
