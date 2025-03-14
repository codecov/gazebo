import { useState } from 'react'
import useDebounce from 'react-use/lib/useDebounce'

import TextInput from 'ui/TextInput'

import RepoOrgNotFound from './RepoOrgNotFound'

interface OrgControlTableProps {
  setSearchValue: (search: string) => void
  searchValue: string
  canRefetch: boolean
}

function OrgControlTable({
  setSearchValue,
  searchValue,
  canRefetch,
}: OrgControlTableProps) {
  const [search, setSearch] = useState(searchValue)

  useDebounce(
    () => {
      setSearchValue(search)
    },
    500,
    [search]
  )

  return (
    <div className="m-4 grid grid-cols-2 items-center justify-items-stretch gap-2 sm:mx-0 lg:flex">
      <TextInput
        dataMarketing="search-repos-list"
        className="w-[255px]"
        value={search}
        placeholder="Search"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        data-testid="org-control-search"
      />
      {canRefetch && <RepoOrgNotFound />}
    </div>
  )
}

export default OrgControlTable
