import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useOwner } from 'services/user'

function Header() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  return (
    <MyContextSwitcher pageName="planTab" activeContext={ownerData?.username} />
  )
}

export default Header
