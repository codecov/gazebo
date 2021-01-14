import Layout from './Layout';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  (Story) => <Layout><Story/></Layout>
]
