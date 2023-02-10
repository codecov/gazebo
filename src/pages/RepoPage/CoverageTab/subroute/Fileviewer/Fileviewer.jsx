import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/treePaths'

function FileView() {
  const { treePaths } = useTreePaths()

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <FileBreadcrumb paths={[...treePaths]} />
        </div>
      }
      sticky
      stickyPadding={225}
    />
  )
}

export default FileView
