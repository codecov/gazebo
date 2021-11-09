import PropTypes from 'prop-types'

function CommitsTable({ commits }) {
  console.log(commits)
  return <h1>this is the commits table</h1>
}
CommitsTable.propTypes = {
  commits: PropTypes.array,
}

export default CommitsTable
