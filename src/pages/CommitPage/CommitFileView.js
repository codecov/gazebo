import { useState } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useFileCoverage } from 'services/file/hooks'
import Breadcrumb from 'ui/Breadcrumb'

import FileViewer from '../FileView/FileViewer'

function CommitFileView({ diff }) {
  const { owner, repo, provider, commit, path } = useParams()
  const [selectedFlags, setSelectedFlags] = useState([])
  const { data } = useFileCoverage({
    provider,
    owner,
    repo,
    ref: commit,
    path: path,
    flags: selectedFlags,
  })

  function getChange() {
    const change = diff?.compareTotals?.coverage - diff?.baseTotals.coverage
    if (isNaN(change)) {
      return 0
    } else {
      return change
    }
  }

  return (
    <FileViewer
      coverage={data?.coverage}
      content={data?.content}
      totals={data?.totals?.coverage}
      treePaths={[]}
      change={getChange()}
      selectedFlags={selectedFlags}
      setSelectedFlags={setSelectedFlags}
      flagNames={data.flagNames}
      title={
        <Breadcrumb
          paths={[
            {
              pageName: 'commit',
              text: 'Impacted files',
              options: { commit: commit },
            },
            { pageName: 'path', text: path.split('/').pop() },
          ]}
        />
      }
    />
  )
}

CommitFileView.propTypes = {
  diff: PropTypes.shape({
    path: PropTypes.string,
    baseTotals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
    compareTotals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
}

export default CommitFileView
