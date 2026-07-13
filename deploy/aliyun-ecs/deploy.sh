#!/usr/bin/env bash
set -euo pipefail

DOMAIN="tidesteelsoul.cn"
SITE_DIR="/var/www/${DOMAIN}"
RELEASE_ARCHIVE="${1:-/tmp/tide-steel-studio-dist.tar.gz}"
NGINX_CONF_SOURCE="${2:-/tmp/tidesteelsoul.cn.conf}"
NGINX_CONF_TARGET="/etc/nginx/sites-available/${DOMAIN}"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/${DOMAIN}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请使用 root 执行：sudo bash deploy.sh"
  exit 1
fi

echo "==> 准备网站目录：${SITE_DIR}"
mkdir -p "${SITE_DIR}"

if [[ -f "${RELEASE_ARCHIVE}" ]]; then
  echo "==> 解压构建包：${RELEASE_ARCHIVE}"
  rm -rf "${SITE_DIR:?}/"*
  tar -xzf "${RELEASE_ARCHIVE}" -C "${SITE_DIR}"
elif [[ -d "./dist" ]]; then
  echo "==> 当前目录存在 dist，直接复制"
  rm -rf "${SITE_DIR:?}/"*
  cp -a ./dist/. "${SITE_DIR}/"
else
  echo "找不到构建包：${RELEASE_ARCHIVE}"
  echo "请先上传 tide-steel-studio-dist.tar.gz 到 /tmp，或在项目根目录运行本脚本。"
  exit 1
fi

echo "==> 设置文件权限"
chown -R www-data:www-data "${SITE_DIR}"
find "${SITE_DIR}" -type d -exec chmod 755 {} \;
find "${SITE_DIR}" -type f -exec chmod 644 {} \;

echo "==> 安装 Nginx 配置"
if [[ -f "${NGINX_CONF_SOURCE}" ]]; then
  cp "${NGINX_CONF_SOURCE}" "${NGINX_CONF_TARGET}"
else
  cat > "${NGINX_CONF_TARGET}" <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name tidesteelsoul.cn www.tidesteelsoul.cn;
    root /var/www/tidesteelsoul.cn;
    index index.html;
    client_max_body_size 200M;
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml application/wasm;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(?:js|css|woff2?|ttf|otf|eot|svg)$ { try_files $uri =404; expires 30d; add_header Cache-Control "public, immutable"; }
    location ~* \.(?:png|jpg|jpeg|webp|gif|ico|avif|glb|gltf|bin|mp4|webm|mov)$ { try_files $uri =404; expires 30d; add_header Cache-Control "public"; add_header Accept-Ranges bytes; }
}
NGINX
fi

ln -sfn "${NGINX_CONF_TARGET}" "${NGINX_CONF_LINK}"
rm -f /etc/nginx/sites-enabled/default

echo "==> 检查并重载 Nginx"
nginx -t
systemctl reload nginx

echo "部署完成：http://${DOMAIN}"
echo "下一步建议执行 HTTPS：sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
