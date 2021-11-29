import PropTypes from 'prop-types'

export const CommitRequestType = {
  author: PropTypes.shape({
    username: PropTypes.string,
  }),
  compareWithParent: PropTypes.shape({
    patchTotals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
  totals: PropTypes.shape({
    coverage: PropTypes.number,
  }),
  parent: PropTypes.shape({
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
  commitid: PropTypes.string,
  message: PropTypes.string,
  createdAt: PropTypes.string,
}
