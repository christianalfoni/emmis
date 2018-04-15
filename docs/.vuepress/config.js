module.exports = {
  title: 'Emmis',
  description: 'Create a chaining API for your application',
  head: [
    ['link', { rel: 'icon', href: `/logo.png` }]
  ],
  serviceWorker: true,
  themeConfig: {
    repo: 'christianalfoni/emmis',
    editLinks: true,
    docsDir: 'docs',
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
      }
    ],
    sidebar: {
      '/guide/': [
        {
          title: 'Guide',
          collapsable: false,
          children: [
            '',
            'how-it-works',
            'operators'
          ]
        }
      ]
    }
  }
}
