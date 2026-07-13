# 《潮汐钢魂》Vercel → 阿里云 ECS 完整迁移方案

目标域名：

- https://tidesteelsoul.cn
- https://www.tidesteelsoul.cn

当前项目结论：

- 前端框架：React + TypeScript + Vite
- 构建命令：`npm run build`
- 构建产物：`dist/`
- 后端 API：无独立后端服务，当前是静态前端
- 登录认证：Supabase Auth，邮箱 + 密码
- 数据库：Supabase Postgres，表 `public.asset_versions`
- 图片/视频资源：Supabase Storage，Bucket `tide-assets`
- 本地缓存：浏览器 IndexedDB / localStorage
- Vercel 作用：静态站点托管，不保存你的业务数据
- 阿里云 ECS 作用：Nginx 托管同一套静态站点

## 一、为什么阿里云页面能打开但没有原来的数据

Vercel 和阿里云是两个不同域名：

- Vercel：`https://tide-steel-studio.vercel.app`
- 阿里云：`https://tidesteelsoul.cn`

浏览器本地数据按域名隔离。之前如果图片只保存在 Vercel 域名下的 IndexedDB，它不会自动出现在 `tidesteelsoul.cn`。

要完全一致，必须使用 Supabase 云端：

旧域名 / 本机浏览器素材
↓
登录 Supabase
↓
点击“迁移本机素材到云端”
↓
新域名登录同一账号
↓
读取同一套云端素材

## 二、环境变量迁移清单

Vite 的 `VITE_*` 环境变量会在构建时写入前端 JS，因此修改后必须重新构建并部署。

```env
VITE_SUPABASE_URL=https://fhdcxmerkerzzexchcjq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=你的 Supabase Publishable 或 anon key
```

当前项目已经在 `src/lib/supabaseClient.ts` 中提供默认 Supabase 配置，但生产部署仍建议使用 `.env.production` 明确配置，避免未来换项目时混乱。

## 三、Supabase 必须完成的配置

### 1. Auth URL Configuration

进入 Supabase Dashboard：

Project Settings
→ Authentication
→ URL Configuration

设置：

Site URL：

```text
https://tidesteelsoul.cn
```

Redirect URLs 添加：

```text
https://tidesteelsoul.cn
https://tidesteelsoul.cn/
https://www.tidesteelsoul.cn
https://www.tidesteelsoul.cn/
https://tide-steel-studio.vercel.app
https://tide-steel-studio.vercel.app/
http://localhost:5173
http://localhost:5173/
```

保存后，邮箱注册、邮件确认、登录回跳才会在阿里云域名正常工作。

### 2. Email Auth

进入：

Authentication
→ Providers
→ Email

确认：

- Email provider：Enabled
- Confirm email：按你的需要开启或关闭
- 如果开启 Confirm email，注册后必须去邮箱点确认链接

### 3. Database + Storage

在 Supabase SQL Editor 执行：

```sql
-- 使用项目中的正式 SQL：
-- supabase/SETUP_TIDE_STEEL_CLOUD.sql
```

它会创建：

- `public.asset_versions`
- RLS 策略
- `tide-assets` 私有 Storage Bucket
- Storage 读写删策略

## 四、ECS 部署方案

当前推荐：Nginx 静态部署。

目录：

```text
/var/www/tidesteelsoul.cn
```

Nginx 配置：

```text
/etc/nginx/sites-available/tidesteelsoul.cn
/etc/nginx/sites-enabled/tidesteelsoul.cn
```

部署脚本：

```text
deploy/aliyun-ecs/deploy.sh
```

部署流程：

```bash
npm run build
tar -czf tide-steel-studio-dist.tar.gz -C dist .
scp tide-steel-studio-dist.tar.gz root@121.41.74.3:/tmp/
scp deploy/aliyun-ecs/deploy.sh root@121.41.74.3:/tmp/
scp deploy/aliyun-ecs/nginx/tidesteelsoul.cn.conf root@121.41.74.3:/tmp/
ssh root@121.41.74.3
bash /tmp/deploy.sh /tmp/tide-steel-studio-dist.tar.gz /tmp/tidesteelsoul.cn.conf
certbot --nginx --reinstall -d tidesteelsoul.cn -d www.tidesteelsoul.cn
nginx -t
systemctl reload nginx
```

## 五、Docker 部署方案

如果以后想用 Docker：

```bash
docker compose -f deploy/aliyun-ecs/docker-compose.yml up -d --build
```

然后用宿主机 Nginx 反向代理到：

```text
http://127.0.0.1:8080
```

当前不强制使用 Docker，因为你的项目是静态前端，Nginx 直接部署更简单。

## 六、Nginx 反向代理 / 静态配置

当前项目没有后端 API，因此 Nginx 只需要静态文件托管和 SPA 回退：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Supabase 请求由浏览器直接访问：

```text
https://fhdcxmerkerzzexchcjq.supabase.co
```

所以 ECS 不需要代理 Supabase API。

## 七、旧数据迁移步骤

如果你的旧图片在 Vercel 页面里能看到：

1. 打开旧 Vercel 地址。
2. 进入“电影母资产库”。
3. 用同一个邮箱登录云端资产库。
4. 点击“迁移本机素材到云端”。
5. 等提示迁移完成。
6. 打开 `https://tidesteelsoul.cn`。
7. 用同一个邮箱登录。
8. 图片、版本、审核状态会从 Supabase 读取。

如果旧 Vercel 页面已经访问不到，且图片没有迁移到云端，那么旧 IndexedDB 数据无法从新域名直接读取。浏览器安全机制不允许一个域名读取另一个域名的 IndexedDB。

## 八、小白操作步骤

### 第一步：确认 Supabase SQL 已执行

Supabase Dashboard
→ SQL Editor
→ New query
→ 粘贴 `supabase/SETUP_TIDE_STEEL_CLOUD.sql`
→ Run

### 第二步：配置 Supabase 登录域名

Supabase Dashboard
→ Authentication
→ URL Configuration
→ 填入上面的 Site URL 和 Redirect URLs
→ Save

### 第三步：重新构建本地项目

在项目根目录执行：

```bash
npm run build
tar -czf tide-steel-studio-dist.tar.gz -C dist .
```

Windows PowerShell 可以继续使用项目已有构建包，或用 7-Zip/脚本打包 `dist` 目录。

### 第四步：上传并部署到 ECS

执行：

```bash
bash /tmp/deploy.sh /tmp/tide-steel-studio-dist.tar.gz /tmp/tidesteelsoul.cn.conf
certbot --nginx --reinstall -d tidesteelsoul.cn -d www.tidesteelsoul.cn
nginx -t
systemctl reload nginx
```

### 第五步：验证

打开：

```text
https://tidesteelsoul.cn
```

验证：

- 页面能打开
- 电影母资产库显示登录框
- 邮箱登录成功
- 上传素材进入 Review
- 刷新页面后素材仍存在
- 手机端登录同一账号后也能看到素材

## 九、常见问题

### 邮箱登录失败

优先检查 Supabase Auth 的 Site URL / Redirect URLs。

### 注册后不能登录

如果开启了 Confirm email，需要先去邮箱确认。

### 登录成功但没有图片

说明旧图片仍在旧域名的浏览器 IndexedDB，没有迁移到 Supabase。

### 上传失败

检查：

- 是否已登录
- `asset_versions` 表是否存在
- `tide-assets` bucket 是否存在
- RLS / Storage policy 是否执行

### 手机看不到电脑上传的素材

说明当前不是云端数据，或者手机没有登录同一个 Supabase 账号。

