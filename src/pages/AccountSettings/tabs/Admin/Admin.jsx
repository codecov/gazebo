import { useParams } from 'react-router-dom'

import { useUser } from 'services/user'

import DetailsSection from './DetailsSection'
import GithubIntegrationSection from './GithubIntegrationSection'
import ManageAdminCard from './ManageAdminCard'
import StudentSection from './StudentSection'

import DeletionCard from '../DeletionCard'

function Admin() {
  const { owner } = useParams()
  const { data: currentUser } = useUser()
  const isPersonalSettings =
    currentUser?.user?.username?.toLowerCase() === owner.toLowerCase()

  return (
    <div className="flex flex-col gap-8 lg:w-3/4">
      {isPersonalSettings ? (
        <>
          <DetailsSection
            email={currentUser.email}
            name={currentUser.user.name}
          />
          <StudentSection isStudent={currentUser.user.student} />
        </>
      ) : (
        <ManageAdminCard />
      )}
      <hr />
      <GithubIntegrationSection />
      <hr />
      <DeletionCard isPersonalSettings={isPersonalSettings} />
    </div>
  )
}

export default Admin
