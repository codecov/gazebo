// import { useParams } from 'react-router-dom'

// import MyContextSwitcher from 'layouts/MyContextSwitcher'
// import TabNavigation from 'ui/TabNavigation'

// Commented for now, as it consumes GraphQL endpoint which is not 100% ready for production
function Header() {
  return null
  // const { owner } = useParams()

  // return (
  //   <>
  // {/* <MyContextSwitcher pageName="ownerInternal" activeContext={owner} /> */}
  //     <div className="my-4">
  //       <TabNavigation
  //         tabs={[
  //           { pageName: 'owner', children: 'Repos' },
  //           { pageName: 'accountAdmin', children: 'Settings' },
  //         ]}
  //       />
  //     </div>
  //   </>
  // )
}

export default Header
