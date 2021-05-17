import MyContextSwitcher from 'layouts/MyContextSwitcher'
import ActiveReposTable from './ActiveReposTable'
import InactiveReposTable from './InactiveReposTable'
import { useRepos } from 'services/repos/hooks'
import { useParams } from 'react-router-dom'
import OptionButton from 'ui/OptionButton'
import { useState } from 'react'

const optionButtonOptions = [
  {
    text: 'Enabled',
  },
  {
    text: 'Not yet setup',
  },
]

function HomePage() {
  const { provider } = useParams()
  const [activeTable, setActiveTable] = useState(optionButtonOptions[0])
  const { data } = useRepos({ provider })

  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
      />
      <div className="flex my-4">
        <OptionButton
          active={activeTable}
          onChange={(option) => setActiveTable(option)}
          options={optionButtonOptions}
        />
      </div>

      {activeTable.text === 'Enabled' ? (
        <ActiveReposTable repos={data.active} />
      ) : (
        <InactiveReposTable repos={data.inactive} />
      )}
    </>
  )
}

export default HomePage
