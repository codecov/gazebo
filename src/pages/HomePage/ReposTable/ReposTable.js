import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useRepos } from 'services/repos/hooks'

import ActiveReposTable from './ActiveReposTable'
import InactiveReposTable from './InactiveReposTable'

function ReposTable({ active, searchValue }) {
  const { provider } = useParams()
  const { data } = useRepos({
    provider,
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
