FROM nginx:1.27-alpine

COPY dist/ /usr/share/nginx/html/
COPY deploy/aliyun-ecs/nginx/tidesteelsoul.cn.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
