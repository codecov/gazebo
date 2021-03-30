import MyContextSwitcher from 'layouts/MyContextSwitcher'

function HomePage() {
  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
      />

      <p>SHOW ALL THE REPOS</p>
    </>
  )
}

export default HomePage
