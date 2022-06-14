import PropTypes from 'prop-types'

import Breadcrumb from 'ui/Breadcrumb'

import { useTreePaths } from './hooks'
import SearchField from './SearchField'

function BreadcrumbSearch({ searchValue, setSearchValue }) {
  const { treePaths } = useTreePaths()
  return (
    <div className="flex justify-between py-6">
      <Breadcrumb paths={[...treePaths]} />
      <SearchField searchValue={searchValue} setSearchValue={setSearchValue} />
    </div>
  )
}

BreadcrumbSearch.propTypes = {
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
}

export default BreadcrumbSearch
