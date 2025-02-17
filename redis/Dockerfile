FROM bitnami/redis-cluster:latest
USER root

# ✅ Copy and set permissions
COPY redis-entrypoint.sh /redis-entrypoint.sh
RUN chmod +x /redis-entrypoint.sh && chown 1001:1001 /redis-entrypoint.sh

# ✅ Switch back to the default non-root user
USER 1001

# ✅ Use as entrypoint
ENTRYPOINT ["/redis-entrypoint.sh"]
