import ActivationCount from './ActivationCount'
import AutoActivation from './AutoActivation'

function AdminMembers() {
  return (
    <div className="flex flex-col gap-4 sm:mr-4 sm:flex-initial w-2/3 lg:w-3/5">
      <div>
        <h2 className="font-semibold text-2xl">Account Members</h2>
        <p>All members under the organization plan and related management</p>
      </div>
      <hr />
      <ActivationCount />
      <AutoActivation />
    </div>
  )
}

export default AdminMembers
