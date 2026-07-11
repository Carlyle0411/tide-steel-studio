# 潮汐钢魂 Tide Steel Studio 正式部署流程

## 目标

把当前本地项目放到 GitHub 仓库，并连接 Netlify 或 Vercel。以后每次更新代码并推送到 GitHub，网站会自动重新部署。

## 当前项目配置

- 构建命令：`npm run build`
- 输出目录：`dist`
- 框架：Vite + React
- Netlify 配置：`netlify.toml`
- Vercel 配置：`vercel.json`

## 第一步：创建 GitHub 仓库

在 GitHub 新建一个空仓库，例如：

`tide-steel-studio`

不要勾选自动创建 README、`.gitignore` 或 license。

## 第二步：本地初始化并推送

在项目根目录执行：

```bash
git init
git add .
git commit -m "Initial Tide Steel Studio"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/tide-steel-studio.git
git push -u origin main
```

把 `YOUR_NAME` 换成你的 GitHub 用户名。

## 第三步：连接 Netlify

1. 打开 Netlify。
2. 选择 Add new site。
3. 选择 Import an existing project。
4. 连接 GitHub。
5. 选择 `tide-steel-studio` 仓库。
6. Build command 使用：`npm run build`
7. Publish directory 使用：`dist`
8. Deploy。

## 第四步：连接 Vercel

1. 打开 Vercel。
2. 选择 Add New Project。
3. 导入 GitHub 仓库。
4. Framework 选择 Vite。
5. Build Command 使用：`npm run build`
6. Output Directory 使用：`dist`
7. Deploy。

## 重要说明

当前网页上传的图片、视频素材保存在浏览器 IndexedDB。正式部署后，网站代码可以在所有设备打开，但每台设备上传的素材仍然只保存在那台设备的浏览器里。

如果未来需要所有设备共用同一套素材库，需要再接入云端存储，例如 Supabase Storage、Cloudflare R2、Vercel Blob 或 Netlify Blobs。

