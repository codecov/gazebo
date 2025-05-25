import { Theme, useThemeContext } from 'shared/ThemeContext'
import { loginProviderImage } from 'shared/utils/loginProviders'
import Button from 'ui/Button'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

const COPY_APP_INSTALL_STRING =
  "Hello, could you help approve the installation of the Codecov AI Reviewer app on GitHub for our organization? Here's the link: [Codecov AI Installation](https://github.com/apps/codecov-ai)"

const InstallCodecovAI: React.FC = () => {
  const { theme } = useThemeContext()
  const isDarkMode = theme === Theme.DARK
  const githubImage = loginProviderImage('GitHub', !isDarkMode)

  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title size="base">
            Install the Codecov AI app on GitHub
          </Card.Title>
        </Card.Header>
        <Card.Content>
          To enable the Codecov AI assistant in your GitHub organization, or on
          specific repositories, you need to install the Codecov AI GitHub App
          Integration. This will allow the assistant to analyze pull requests
          and provide insights.
          <div className="mt-4 flex">
            <Button
              to={{
                pageName: 'codecovAIAppInstallation',
              }}
              variant="github"
              disabled={undefined}
              hook={undefined}
            >
              <img alt={`github logo`} className="h-6 pr-1" src={githubImage} />
              Install Codecov AI
            </Button>
          </div>
          <p className="my-4">
            If you&apos;re not an admin, copy the link below and share it with
            your organization&apos;s admin or owner to install:
          </p>
          <CodeSnippet clipboard={COPY_APP_INSTALL_STRING}>
            <div className="w-[90%] text-wrap font-sans font-light">
              {COPY_APP_INSTALL_STRING}
            </div>
          </CodeSnippet>
        </Card.Content>
      </Card>
    </div>
  )
}

export default InstallCodecovAI
