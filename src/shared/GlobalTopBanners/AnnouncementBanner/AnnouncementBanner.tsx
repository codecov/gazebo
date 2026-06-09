import { useParams } from 'react-router-dom'

import { useOwner } from 'services/user/useOwner'
import A from 'ui/A'
import TopBanner from 'ui/TopBanner'

interface URLParams {
  owner: string
}

const AnnouncementBanner = () => {
  const { owner } = useParams<URLParams>()
  const { data: ownerData } = useOwner({ username: owner })
  const isOnlyUsingSentryApp = !!ownerData?.isOnlyUsingSentryApp

  if (isOnlyUsingSentryApp) {
    return (
      <TopBanner variant="importantAnnouncement">
        <TopBanner.Start>
          <p className="font-semibold text-white">
            Codecov is now{' '}
            <A
              to={{ pageName: 'announcementBlog' }}
              isExternal
              hook="announcement-blog-link"
            >
              part of Harness
            </A>
            . You are currently using the Sentry GitHub app and need to migrate
            to the{' '}
            <A
              to={{ pageName: 'codecovGitHubApp' }}
              isExternal
              hook="codecov-github-app-link"
            >
              Codecov GitHub app
            </A>{' '}
            to retain functionality.
          </p>
        </TopBanner.Start>
      </TopBanner>
    )
  }

  return (
    <TopBanner variant="importantAnnouncement">
      <TopBanner.Start>
        <p className="font-semibold text-white">
          Codecov is joining Harness. Read more about the announcement{' '}
          <A
            to={{ pageName: 'announcementBlog' }}
            isExternal
            hook="announcement-blog-link"
          >
            here
          </A>
          .
        </p>
      </TopBanner.Start>
    </TopBanner>
  )
}

export default AnnouncementBanner
