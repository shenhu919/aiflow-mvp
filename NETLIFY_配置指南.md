# AIFlow MVP - Netlify 配置指南

## 环境变量配置

当前 MVP 是纯前端应用，暂不需要环境变量。
为未来扩展预留，建议在 Netlify 控制台配置以下变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `https://api.aiflow.com` |
| `VITE_WS_URL` | WebSocket 地址（实时更新） | `wss://api.aiflow.com/ws` |
| `VITE_APP_TITLE` | 应用标题 | `AIFlow MVP` |
| `VITE_OPENAI_API_KEY` | OpenAI API Key（如需前端调用） | `sk-...` |

> 注意：Vite 项目中，只有 `VITE_` 开头的变量才能在前端代码中通过 `import.meta.env.VITE_XXX` 访问。

## 持续部署配置

### 前提条件
- GitHub 仓库已创建：https://github.com/shenhu919/aiflow-mvp
- 需要能访问 GitHub 的网络环境

### 配置步骤

1. **推送代码到 GitHub**（需要在能访问 GitHub 的环境中执行）：
   ```bash
   cd /c/Users/11943/WorkBuddy/2026-05-11-task-3/aiflow-mvp
   git remote add origin https://github.com/shenhu919/aiflow-mvp.git
   git branch -M main
   git push -u origin main
   ```

2. **在 Netlify 连接 GitHub**：
   - 访问：https://app.netlify.com/projects/super-semolina-8b5e49/settings/deploys
   - 点击 "Connect repository"
   - 选择 `shenhu919/aiflow-mvp`
   - 配置构建命令：`npm run build`
   - 发布目录：`dist`

3. **自动部署**：
   - 每次推送到 `main` 分支，Netlify 会自动重新构建和部署

## 手动部署（当前可用）

如果无法配置持续部署，可以手动构建并部署：

```bash
cd /c/Users/11943/WorkBuddy/2026-05-11-task-3/aiflow-mvp
npm install
npm run build
netlify deploy --prod --dir=dist
```

## Netlify 站点信息

- **站点名称**：preeminent-basbousa-eeddf4
- **站点 URL**：https://preeminent-basbousa-eeddf4.netlify.app
- **Netlify 控制台**：https://app.netlify.com/projects/super-semolina-8b5e49
- **站点 ID**：4363e300-b347-4477-8a10-ff979a3d9c15
