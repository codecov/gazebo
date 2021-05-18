import MyContextSwitcher from 'layouts/MyContextSwitcher'
import OrgsTable from './OrgsTable'

function HomePage() {
  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
      />
      <OrgsTable />

      <p>SHOW ALL THE REPOS</p>
    </>
  )
}

export default HomePage
