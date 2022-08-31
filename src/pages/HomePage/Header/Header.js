import { useParams } from 'react-router-dom'

import config from 'config'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { providerFeedback } from 'shared/utils'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Icon from 'ui/Icon'

function Header() {
  const { provider } = useParams()

  return (
    <>
      {!config.IS_ENTERPRISE && (
        <Banner>
          <BannerHeading>
            <div className="flex justify-center gap-2">
              <Icon name="speakerphone"></Icon>
              <h2>Updating our web app</h2>
            </div>
          </BannerHeading>
          <BannerContent>
            <p>
              We’ve been making changes to the web experience and will be
              continuously releasing a new experience over the next few months.
              We would love to hear your feedback! Let us know what you think in{' '}
              <A
                hook="feedback"
                href={providerFeedback(provider)}
                isExternal={true}
              >
                this issue
              </A>
              .
            </p>
          </BannerContent>
        </Banner>
      )}
      <MyContextSwitcher pageName="owner" activeContext={null} />
    </>
  )
}

export default Header
