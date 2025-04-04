import { Redirect, useParams } from 'react-router-dom'

import { useCodecovAIInstallation } from 'services/codecovAI/useCodecovAIInstallation'
import { useFlags } from 'shared/featureFlags'

import CodecovAICommands from './CodecovAICommands/CodecovAICommands'
import ConfiguredRepositories from './ConfiguredRepositories/ConfiguredRepositories'
import InstallCodecovAI from './InstallCodecovAI/InstallCodecovAI'
import LearnMoreBlurb from './LearnMoreBlurb/LearnMoreBlurb'
import Tabs from './Tabs/Tabs'

interface URLParams {
  provider: string
  owner: string
}

const CodecovAIPage: React.FC = () => {
  const { provider, owner } = useParams<URLParams>()
  const { codecovAiFeaturesTab } = useFlags({
    codecovAiFeaturesTab: true,
  })

  const { data: installationData } = useCodecovAIInstallation({
    owner,
    provider,
  })

  if (!codecovAiFeaturesTab) {
    return <Redirect to={`/${provider}/${owner}`} />
  }

  return (
    <>
      <Tabs />
      <h2 className="mx-4 text-lg font-semibold sm:mx-0">Codecov AI</h2>
      <section>
        <p className="flex flex-col gap-4 sm:mr-4 sm:flex-initial lg:w-3/5">
          Codecov AI is a generative AI assistant developed by Codecov at
          Sentry. It helps you review your code changes, offering suggestions
          for improvement before merging pull requests.
        </p>
      </section>
      <div className="flex flex-col gap-4 pt-2 lg:w-3/5">
        {installationData?.aiFeaturesEnabled ? (
          <ConfiguredRepositories />
        ) : (
          <InstallCodecovAI />
        )}
        <CodecovAICommands />
        <LearnMoreBlurb />
      </div>
    </>
  )
}

export default CodecovAIPage
