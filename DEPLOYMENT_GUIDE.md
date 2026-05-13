# AIFlow MVP 部署指南

## 构建状态
✅ 构建成功 (2026-05-11)
- 构建工具：Vite 8.0.12
- 输出目录：`dist/`
- 构建产物：
  - `index.html` (0.46 kB)
  - `assets/index-*.css` (28.54 kB)
  - `assets/index-*.js` (305.70 kB)

## 部署选项

### 选项1：Vercel (推荐)

#### 方法A：通过 GitHub 自动部署 (推荐)

1. **初始化 Git 仓库**
```bash
cd C:\Users\11943\WorkBuddy\2026-05-11-task-3\aiflow-mvp
git init
git add .
git commit -m "Initial commit: AIFlow MVP"
```

2. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 仓库名：`aiflow-mvp`
   - 选择 Public 或 Private
   - 不要初始化 README、.gitignore 等
   - 点击 "Create repository"

3. **推送到 GitHub**
```bash
git remote add origin https://github.com/你的用户名/aiflow-mvp.git
git branch -M main
git push -u origin main
```

4. **部署到 Vercel**
   - 访问 https://vercel.com
   - 点击 "Add New..." → "Project"
   - 导入 GitHub 仓库 `aiflow-mvp`
   - Vercel 会自动检测 Vite 配置
   - 点击 "Deploy"

#### 方法B：直接上传 (快速演示)

1. 访问 https://vercel.com
2. 点击 "Add New..." → "Project"
3. 选择 "Browse" 上传 `dist/` 文件夹
4. 等待部署完成

### 选项2：Netlify

#### 方法A：通过 GitHub 自动部署

1. 完成上述 GitHub 仓库创建步骤
2. 访问 https://app.netlify.com
3. 点击 "Add new site" → "Import an existing project"
4. 选择 GitHub 并授权
5. 选择 `aiflow-mvp` 仓库
6. 配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
7. 点击 "Deploy"

#### 方法B：拖拽上传 (最快)

1. 访问 https://app.netlify.com
2. 将 `dist/` 文件夹拖拽到页面中央的 "Want to deploy a new site? Drag and drop your site folder here"
3. 等待上传和部署完成
4. 获得 `https://随机名称.netlify.app` 的演示地址

### 选项3：GitHub Pages (免费)

1. **安装 gh-pages**
```bash
cd C:\Users\11943\WorkBuddy\2026-05-11-task-3\aiflow-mvp
npm install -D gh-pages
```

2. **添加部署脚本到 package.json**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **部署**
```bash
npm run deploy
```

4. 访问 `https://你的用户名.github.io/aiflow-mvp/`

## 推荐流程 (最快)

**对于快速演示**：使用 Netlify 拖拽上传
1. 访问 https://app.netlify.com
2. 拖拽 `dist/` 文件夹
3. 获得演示 URL (30秒完成)

**对于正式部署**：使用 Vercel + GitHub
- 自动部署
- 每次 push 自动更新
- 自定义域名支持

## 注意事项

1. **SPA 路由配置**
   - Vercel: 自动处理
   - Netlify: 需要 `public/_redirects` 文件：
     ```
     /*  /index.html  200
     ```

2. **构建命令**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **环境变量**
   - 当前 MVP 不需要环境变量
   - 未来连接后端 API 时需要配置

## 下一步

部署成功后：
1. 测试所有页面功能
2. 分享演示链接
3. 收集用户反馈
4. 规划后端 API 集成
