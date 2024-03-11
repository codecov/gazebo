import ToggleHeader from 'pages/PullRequestPage/Header/ToggleHeader/ToggleHeader'
import A from 'ui/A'
import Icon from 'ui/Icon'

function IndirectChangesInfo() {
  return (
    <div>
      <div className="flex justify-between bg-ds-gray-primary p-2">
        <div className="flex items-center gap-1">
          <Icon name="information-circle" size="sm" />
          <p>
            These are files that didn&apos;t have author revisions, but contain
            unexpected coverage changes{' '}
            <A to={{ pageName: 'unexpectedChanges' }}>learn more.</A>
          </p>
        </div>
      </div>
      <ToggleHeader />
    </div>
  )
}

export default IndirectChangesInfo
