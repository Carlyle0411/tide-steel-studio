# Tide Steel Studio 云端部署说明

当前项目已经构建为静态网页，可以部署到任何静态网站平台。

## 最快方式：Vercel 手动上传

1. 打开 https://vercel.com/new
2. 登录后选择 `Deploy manually` 或拖拽上传。
3. 上传本项目根目录下的压缩包：
   `TIDE_STEEL_STUDIO_DIST.zip`
4. 部署完成后，Vercel 会生成一个公网地址：
   `https://你的项目名.vercel.app`

## Netlify Drop

1. 打开 https://app.netlify.com/drop
2. 直接拖拽上传 `TIDE_STEEL_STUDIO_DIST.zip`
3. 等待部署完成，获得公网 URL。

## Cloudflare Pages

1. 打开 Cloudflare Dashboard。
2. 进入 Pages。
3. 选择 Direct Upload。
4. 上传 `TIDE_STEEL_STUDIO_DIST.zip`。

## 重要说明

网页部署到云端后，手机和其它设备可以打开同一个地址。

但当前素材上传功能使用浏览器本地 IndexedDB：

- 你在电脑上传的图片，只保存在电脑浏览器里。
- 手机打开云端网页后，可以访问界面，但看不到电脑浏览器里的本地上传图片。
- 手机也可以上传自己的图片，但那会保存在手机浏览器本地。

如果要让所有设备共享同一套图片素材库，下一步需要增加云端存储，例如 Supabase Storage、Cloudflare R2 或 Vercel Blob。
