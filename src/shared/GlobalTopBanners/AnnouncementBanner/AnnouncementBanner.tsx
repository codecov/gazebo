import A from 'ui/A'
import TopBanner from 'ui/TopBanner'

const AnnouncementBanner = () => {
  return (
    <TopBanner variant="importantAnnouncement">
      <TopBanner.Start>
        <p className="font-semibold">
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
