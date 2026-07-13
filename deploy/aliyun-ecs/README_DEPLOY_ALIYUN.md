# 《潮汐钢魂》阿里云 ECS 部署说明

项目类型：React + TypeScript + Vite 静态前端。  
生产目录：`dist/`。  
推荐部署：Nginx 直接托管静态文件，不需要 Node 常驻运行。

## 服务器信息

- 系统：Ubuntu 24.04
- 域名：`tidesteelsoul.cn`
- 网站目录：`/var/www/tidesteelsoul.cn`
- Nginx 配置：`/etc/nginx/sites-available/tidesteelsoul.cn`

## 本地构建

在 Windows 项目根目录执行：

```powershell
npm.cmd install
npm.cmd run build
Compress-Archive -Path dist\* -DestinationPath tide-steel-studio-dist.zip -Force
```

如果服务器使用脚本的默认 `.tar.gz` 文件名，可以在 PowerShell 里执行：

```powershell
tar -czf tide-steel-studio-dist.tar.gz -C dist .
```

## 上传到服务器

把这 3 个文件上传到服务器 `/tmp`：

- `tide-steel-studio-dist.tar.gz`
- `deploy/aliyun-ecs/deploy.sh`
- `deploy/aliyun-ecs/nginx/tidesteelsoul.cn.conf`

Windows PowerShell 示例：

```powershell
scp tide-steel-studio-dist.tar.gz root@121.41.74.3:/tmp/
scp deploy/aliyun-ecs/deploy.sh root@121.41.74.3:/tmp/
scp deploy/aliyun-ecs/nginx/tidesteelsoul.cn.conf root@121.41.74.3:/tmp/
```

## 服务器执行部署

```bash
ssh root@121.41.74.3
sudo bash /tmp/deploy.sh /tmp/tide-steel-studio-dist.tar.gz /tmp/tidesteelsoul.cn.conf
```

完成后先打开：

```text
http://tidesteelsoul.cn
```

## 配置 HTTPS

安装 Certbot：

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

申请证书：

```bash
sudo certbot --nginx -d tidesteelsoul.cn -d www.tidesteelsoul.cn
```

Certbot 会自动修改 Nginx 配置并启用 HTTPS。

证书自动续期测试：

```bash
sudo certbot renew --dry-run
```

## 大文件优化建议

1. 图片：
   - 优先使用 WebP / AVIF。
   - 大图建议 1920 宽以内，缩略图单独生成。
   - 真实资产原图放 Supabase Storage / 阿里云 OSS，网页只加载预览图。

2. 视频：
   - 网站预览视频建议 H.264 MP4，码率控制在 3-8Mbps。
   - 大视频不建议直接打包进 `dist`，建议迁移到 OSS。

3. GLB / GLTF：
   - 使用 Draco / Meshopt 压缩。
   - 贴图压成 WebP 或 KTX2。
   - 模型按页面懒加载，首屏不要一次性加载所有 3D 资源。

4. CDN / OSS：
   - 阿里云 OSS 存放：视频、高清图、GLB。
   - 阿里云 CDN 加速 OSS 域名。
   - 前端只保存资源 URL，减少 ECS 磁盘和带宽压力。

## Docker 方案

本项目是静态站，Docker 不是必需。若后续你想容器化：

```bash
docker compose -f deploy/aliyun-ecs/docker-compose.yml up -d --build
```

然后 Nginx 可反向代理到 `127.0.0.1:8080`。
