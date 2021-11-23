import PropTypes from 'prop-types'

export const PullRequestType = {
  author: PropTypes.shape({
    username: PropTypes.string,
  }),
  compareWithBase: PropTypes.shape({
    patchTotals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
  head: PropTypes.shape({
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
  pullId: PropTypes.number,
  state: PropTypes.string,
  title: PropTypes.string,
  updatestamp: PropTypes.string,
}
