import { useParams } from 'react-router-dom'
import FileViewer from '../FileView/FileViewer'
import { useFileCoverage } from 'services/file/hooks'
import Breadcrumb from 'ui/Breadcrumb'

function CommitFileView() {
  const { owner, repo, provider, commit, path } = useParams()
  const { data } = useFileCoverage({
    provider,
    owner,
    repo,
    ref: commit,
    path: path,
  })

  return (
    <FileViewer
      coverage={data?.coverage}
      content={data?.content}
      totals={data?.totals?.coverage}
      treePaths={[]}
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

export default CommitFileView
