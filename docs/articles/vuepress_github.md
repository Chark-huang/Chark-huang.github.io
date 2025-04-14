# 使用 VitePress + GitHub Pages 部署博客项目

## 1. 初始项目化

首先，让我们在当前目录初始化一个新的 VitePress 项目

```bash
npm init -y
```

安装 VitePress 和 Vue 作为依赖：

```bash
npm install -D vitepress vue
```

## 2. 创建基本项目结构

```bash
mkdir -p docs/.vitepress/config
```

## 3. 配置 VitePress

创建 VitePress 的配置文件：`docs/.vitepress/config.js`

```javascript
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "xx的博客",
  description: "个人技术博客",
  base: '/xx-xx.github.io/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/articles/' },
      { text: '关于', link: '/about/' }
    ],
    sidebar: {
      '/articles/': [
        {
          text: '文章列表',
          items: [
            { text: '示例文章', link: '/articles/example' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xx-xx' }
    ],
    footer: {
      message: '基于 VitePress 构建',
      copyright: 'Copyright © 2023-present xx'
    }
  }
})
```

## 4. 创建首页

创建首页内容：`docs/index.md`

```markdown
---
layout: home
hero:
  name: xx的博客
  text: 技术分享与个人随笔
  tagline: 记录学习、工作和生活
  actions:
    - theme: brand
      text: 开始阅读
      link: /articles/
    - theme: alt
      text: 关于我
      link: /about/
features:
  - title: 技术分享
    details: 分享编程技术、开发经验和学习心得
  - title: 项目展示
    details: 展示个人项目和开源贡献
  - title: 生活随笔
    details: 记录生活点滴和个人感悟
---
```

## 5. 添加文章

创建文章索引页面：`docs/articles/index.md`

```markdown
# 文章列表

这里是所有文章的索引页面。

- [示例文章](/articles/example)
```

创建示例文章：

```markdown
# 示例文章

这是一篇示例文章，展示 VitePress 的基本用法。

## Markdown 支持

VitePress 支持所有标准的 Markdown 语法。

### 代码块

```js
console.log('Hello, VitePress!')
```

## 6. 更新package.json 添加脚本

```json
{
  "name": "xx-xx.github.io",
  "version": "1.0.0",
  "description": "xx的个人博客",
  "main": "index.js",
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "keywords": [
    "blog",
    "vitepress",
    "vue"
  ],
  "author": "xx",
  "license": "MIT",
  "devDependencies": {
    "vitepress": "^1.0.0-rc.4",
    "vue": "^3.3.4"
  }
}
```

## 7. 创建.gitignore文件

以下数据包含了常见的IDE / 项目目录文件，无需上传至git

```
node_modules
.DS_Store
dist
dist-ssr
*.local
docs/.vitepress/dist
docs/.vitepress/cache
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## 8. 本地测试

在项目根目录运行项目：

```bash
# 
npm run docs:dev
```

## 9. 创建 & 部署至GitHub

#### 1. 创建 GitHub 仓库

1. 登录到你的 GitHub 账户。
2. 点击右上角的 "+" 按钮，选择 "New repository"。
3. 在 "Repository name" 字段中输入 `username.github.io`（将 `username` 替换为你的 GitHub 用户名）。
4. 选择 "Public"（公开）或 "Private"（私有），然后点击 "Create repository"。
5. 按照github的提示进行命令的执行
   ``` bash
   echo "# xx-xx.github.io" >> README.md
   git init
   git add README.md
   git commit -m "first commit"
   git branch -M main
   git remote add origin git@github.com:xx-xx/xx-xx.github.io.git
   git push -u origin main
   ```
#### 2. 创建GitHub Actions工作流 进行自动部署

为了自动部署到 GitHub Pages，创建 GitHub Actions 工作流配置文件：`.github/workflows/deploy.yml`

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
      
      - name: Setup Pages
        uses: actions/configure-pages@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run docs:build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

最后保存更改，提交代码`git push -u origin main`即可