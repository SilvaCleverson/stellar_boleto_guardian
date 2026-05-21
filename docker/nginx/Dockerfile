FROM nginx:1.27-alpine

# Remove o default.conf padrão
RUN rm /etc/nginx/conf.d/default.conf

# Templates são processados pelo envsubst no entrypoint da imagem oficial nginx,
# substituindo ${VAR} pelas variáveis de ambiente, e o resultado vai para
# /etc/nginx/conf.d/ (mesmo nome, sem .template).
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Limita o envsubst APENAS à variável ADMIN_API_KEY — assim os $variables
# nativos do nginx ($host, $remote_addr, $uri, …) ficam preservados.
ENV NGINX_ENVSUBST_FILTER=^ADMIN_API_KEY$

COPY web/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1
