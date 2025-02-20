FROM redis:latest
USER root

RUN apt-get update && apt-get install -y redis-server

# ✅ Copy and set permissions
COPY redis.conf /etc/redis/redis.conf
COPY redis-entrypoint.sh /redis-entrypoint.sh
RUN chmod +x /redis-entrypoint.sh && chown 1001:1001 /redis-entrypoint.sh

RUN chown -R redis:redis /data
RUN chmod -R 777 /data


# ✅ Switch back to the default non-root user
USER 1001

# ✅ Use as entrypoint
ENTRYPOINT ["/redis-entrypoint.sh"]
