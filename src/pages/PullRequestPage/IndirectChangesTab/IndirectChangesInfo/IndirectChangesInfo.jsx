import A from 'ui/A'
import Icon from 'ui/Icon'

function IndirectChangesInfo() {
  return (
    <div className="mt-.5 flex items-center gap-1 border-t bg-slate-100 p-1">
      <Icon name="information-circle" size="sm" />
      <p>
        These are files that didn&apos;t have author revisions, but contain
        unexpected coverage changes{' '}
        <A to={{ pageName: 'unexpectedChanges' }}>learn more.</A>
      </p>
    </div>
  )
}

export default IndirectChangesInfo
