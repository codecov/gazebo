import PropTypes from 'prop-types'

import { useRepos } from 'services/repos/hooks'

import ActiveReposTable from './ActiveReposTable'
import InactiveReposTable from './InactiveReposTable'

function ReposTable({ active, searchValue }) {
  const { data } = useRepos({
    active,
    term: searchValue,
  })

  return active ? (
    <ActiveReposTable repos={data.repos} />
  ) : (
    <InactiveReposTable repos={data.repos} />
  )
}

ReposTable.propTypes = {
  active: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
}

export default ReposTable
