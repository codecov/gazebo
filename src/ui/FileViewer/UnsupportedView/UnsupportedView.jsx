import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import Title from 'ui/FileViewer/ToggleHeader/Title'

function UnsupportedView() {
  return (
    <>
      <Title
        title={
          <div className="text-sm font-normal">
            <FileBreadcrumb />
          </div>
        }
      />
      <h1>Binary file</h1>
    </>
  )
}

export default UnsupportedView
