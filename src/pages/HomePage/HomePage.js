import MyContextSwitcher from 'layouts/MyContextSwitcher'
import OrgsTable from './OrgsTable'
import { useRepos } from 'services/repos/hooks'
import { useParams } from 'react-router-dom'
import OptionButton from 'ui/OptionButton'

function HomePage() {
  const { provider } = useParams()

  const { data } = useRepos({ provider })
  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
      />
      <OptionButton
        initialStateIndex={1}
        onChange={(option) => {}}
        options={[{ text: 'Enabled' }, { text: 'Not yet setup' }]}
      />
      <OrgsTable repos={data.repos} />

      <p>SHOW ALL THE REPOS</p>
    </>
  )
}

export default HomePage
