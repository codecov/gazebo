import { Meta, StoryObj } from '@storybook/react'

import { CodeSnippet } from './CodeSnippet'

const meta: Meta<typeof CodeSnippet> = {
  title: 'Components/CodeSnippet',
  component: CodeSnippet,
  argTypes: {
    clipboard: {
      description: "The string to be copied to the user's clipboard",
      control: 'text',
    },
  },
}
export default meta

type Story = StoryObj<typeof CodeSnippet>

export const Default: Story = {
  args: {
    clipboard: 'CODECOV_TOKEN=asdf1234',
  },
  render: ({ clipboard }) => (
    <CodeSnippet clipboard={clipboard}>{clipboard}</CodeSnippet>
  ),
}

export const WithoutClipboard: Story = {
  render: () => <CodeSnippet>CODECOV_TOKEN=asdf1234</CodeSnippet>,
}

const multiline = `- name: Upload coverage reports to Codecov
uses: codecov/codecov-action@v4.0.1
with:
  token: \${{ secrets.CODECOV_TOKEN }}`

export const Multiline: Story = {
  render: () => <CodeSnippet clipboard={multiline}>{multiline}</CodeSnippet>,
}

const overflow = `# download Codecov CLI
curl -Os https://cli.codecov.io/latest/linux/codecov

# integrity check
curl https://keybase.io/codecovsecurity/pgp_keys.asc | gpg --no-default-keyring --keyring trustedkeys.gpg --import # One-time step  
curl -Os https://cli.codecov.io/latest/linux/codecov
curl -Os https://cli.codecov.io/latest/linux/codecov.SHA256SUM
curl -Os https://cli.codecov.io/latest/linux/codecov.SHA256SUM.sig
gpgv codecov.SHA256SUM.sig codecov.SHA256SUM

shasum -a 256 -c codecov.SHA256SUM
sudo chmod +x codecov
./codecov --help
`

export const Overflow: Story = {
  render: () => <CodeSnippet clipboard={overflow}>{overflow}</CodeSnippet>,
}
