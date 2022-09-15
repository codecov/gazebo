import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function UploaderCheckBanner() {
  return (
    <Banner variant="plain">
      <BannerHeading>
        <div className="font-semibold text-sm">
          It is highly recommended to{' '}
          <A to={{ pageName: 'integrityCheck' }}>
            integrity check the uploader
          </A>
        </div>
      </BannerHeading>
      <BannerContent>
        This will verify the uploader integrity before uploading to Codecov.
      </BannerContent>
    </Banner>
  )
}

export default UploaderCheckBanner
