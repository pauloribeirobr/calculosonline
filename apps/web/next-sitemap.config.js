/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://calculosonline.com.br',
  generateRobotsTxt: false, // robots.txt já existe em public/
  changefreq: 'weekly',
  priority: 0.8,
  sitemapSize: 5000,
  exclude: ['/api/*', '/admin/*'],
  transform: async (config, path) => {
    // Prioridade maior para páginas de calculadora
    if (path.startsWith('/calculadora/')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      }
    }
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}
