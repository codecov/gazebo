import config from 'config'

import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

function UploaderCheckBanner() {
  return (
    <Banner variant="plain">
      <BannerHeading>
        <p className="font-semibold text-sm">
          It is highly recommended to{' '}
          <A to={{ pageName: 'integrityCheck' }}>
            integrity check the uploader
          </A>
        </p>
      </BannerHeading>
      <BannerContent>
        This will verify the uploader integrity before uploading to Codecov.
        {config.IS_SELF_HOSTED && (
          <p>
            You can use the SHASUMs located at {config.BASE_URL}
            /uploader to integrity check against the version of the uploader
            bundled with your Codecov installation.
          </p>
        )}
      </BannerContent>
    </Banner>
  )
}

export default UploaderCheckBanner
