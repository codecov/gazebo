import isEmpty from 'lodash/isEmpty'
import PropType from 'prop-types'

function NoReposBlock({ searchValue }) {
  if (!isEmpty(searchValue)) {
    return <h1 className="mt-8 text-center text-lg">No results found</h1>
  }

  return (
    <h1 className="mt-8 text-center text-2xl font-semibold">
      There are no repos detected
    </h1>
  )
}

NoReposBlock.propTypes = {
  searchValue: PropType.string,
}

export default NoReposBlock
