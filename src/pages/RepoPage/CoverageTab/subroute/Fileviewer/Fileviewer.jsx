import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/useTreePaths'

function FileView() {
  const { treePaths } = useTreePaths()

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <FileBreadcrumb paths={[...treePaths]} />
        </div>
      }
    />
  )
}

export default FileView
