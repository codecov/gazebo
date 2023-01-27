import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import config from 'config'

import SettingsDescriptor from 'ui/SettingsDescriptor'
import TokenWrapper from 'ui/TokenWrapper'

const useBadges = ({ graphToken, defaultBranch }) => {
  const { provider, owner, repo } = useParams()

  const repoPath = `${config.BASE_URL}/${provider}/${owner}/${repo}`
  const fullPath = `${repoPath}/branch/${defaultBranch}/graph/badge.svg?token=${graphToken}`

  const BadgesEnum = Object.freeze({
    MARKDOWN: `[![codecov](${fullPath})](${repoPath})`,
    HTML: `<a href="${repoPath}" > \n <img src="${fullPath}"/> \n </a>`,
    RST: `.. image:: ${fullPath} \n :target: ${repoPath}`,
  })

  return BadgesEnum
}

function Badges({ graphToken, defaultBranch }) {
  const BadgesEnum = useBadges({ graphToken, defaultBranch })

  return (
    <SettingsDescriptor
      title="Codecov badge"
      description="A live icon that you can embed in code, such as in a README.md, to provide quick insight into your project's code coverage percentage."
      content={
        <>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">Markdown</h2>
            <TokenWrapper token={BadgesEnum.MARKDOWN} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">HTML</h2>
            <TokenWrapper token={BadgesEnum.HTML} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">RST</h2>
            <TokenWrapper token={BadgesEnum.RST} />
          </div>
        </>
      }
    />
  )
}

Badges.propTypes = {
  defaultBranch: PropTypes.string,
  graphToken: PropTypes.string.isRequired,
}

export default Badges
