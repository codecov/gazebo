import MyContextSwitcher from 'layouts/MyContextSwitcher'
import ActiveReposTable from './ActiveReposTable'
import InactiveReposTable from './InactiveReposTable'
import { useRepos } from 'services/repos/hooks'
import { useParams } from 'react-router-dom'
import OptionButton from 'ui/OptionButton'
import { useState } from 'react'
import TextInput from 'ui/TextInput/TextInput'
import Select from 'old_ui/Select'
import { debounce } from 'lodash'

const sortItems = [
  'Most recent commit',
  'Least recent commit',
  'Highest coverage',
  'Lowest coverage',
  'Name [A-Z]',
  'Name [Z-A]',
]

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
  const [sortItem, setSortItem] = useState(sortItems[0])
  const [searchValue, setSearchValue] = useState('')
  const { data } = useRepos({
    provider,
    active: activeTable,
    term: searchValue,
  })

  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
      />
      <div className="flex justify-between h-8 my-4">
        <div className="flex">
          <div className="w-52 mr-2">
            <Select
              className="h-8"
              value={sortItem}
              items={sortItems}
              onChange={setSortItem}
            />
          </div>
          <div className="w-52">
            <TextInput
              onChange={debounce((e) => setSearchValue(e.target.value))}
            />
          </div>
        </div>
        <OptionButton
          active={activeTable}
          onChange={(option) => setActiveTable(option)}
          options={optionButtonOptions}
        />
      </div>

      {activeTable.text === 'Enabled' ? (
        <ActiveReposTable repos={data.repos} />
      ) : (
        <InactiveReposTable repos={data.repos} />
      )}
    </>
  )
}

export default HomePage
