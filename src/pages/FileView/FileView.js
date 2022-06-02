import { useParams } from 'react-router-dom'

import Breadcrumb from 'ui/Breadcrumb'

import RawFileviewer from '../../shared/RawFileviewer'

function FileView() {
  const { owner, repo, ref } = useParams()

  return (
    <div className="flex flex-col gap-4">
      <div className="px-3 sm:px-0">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
            { pageName: '', readOnly: true, text: ref },
          ]}
        />
      </div>
      <RawFileviewer title="File Viewer" />
    </div>
  )
}

export default FileView
