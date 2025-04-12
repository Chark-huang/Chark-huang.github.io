import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Chark的博客",
  description: "个人技术博客",
  base: '/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/articles/' },
    ],
    sidebar: {
      '/articles/': [
        {
          text: '文章列表',
          items: [
            { text: 'VitePress + GitHub Pages 部署博客项目', link: '/articles/vuepress_github' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Chark-huang' }
    ],
    footer: {
      message: '基于 VitePress 构建',
      copyright: 'Copyright © 2023-present Chark'
    }
  }
})