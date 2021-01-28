import Button from 'ui/Button'
import Card from 'ui/Card'

import githubLogo from 'assets/githublogo.png'

function GithubMarketplaceCard() {
  return (
    <Card className="p-6 mb-4">
      <div className="flex items-center">
        <img alt="Github" src={githubLogo} height={32} width={32} />
        <h2 className="text-2xl bold ml-4">Manage billing in GitHub</h2>
      </div>
      <p className="mt-4 mb-6">
        Manage billing and credits in the GitHub Marketplace.
      </p>
      <div className="text-center">
        <Button Component="a" href="https://github.com/marketplace/codecov">
          Manage billing in GitHub
        </Button>
      </div>
    </Card>
  )
}

export default GithubMarketplaceCard
