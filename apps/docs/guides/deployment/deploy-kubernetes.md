# How to deploy to Kubernetes

> ⚠️ **Future Feature**: This guide describes the planned Kubernetes deployment architecture. The Helm charts, manifests, and automation tools are in development.

This guide walks you through deploying the Panels application to Kubernetes using cloud-native best practices and modern deployment patterns.

## Prerequisites

- Kubernetes cluster (v1.28+)
- kubectl configured for your cluster
- Helm 3.x installed
- Docker registry access
- Persistent storage available (for databases)
- LoadBalancer support (cloud provider or ingress controller)

## Architecture Overview

The Panels application will be deployed as a microservices architecture on Kubernetes:

\`\`\`mermaid
graph TB
    Internet[Internet] --> Ingress[Ingress Controller]
    Ingress --> Frontend[Frontend Service]
    Ingress --> API[API Service]
    
    Frontend --> FrontendPods[Frontend Pods]
    API --> APIPods[API Pods]
    
    APIPods --> Database[(PostgreSQL)]
    APIPods --> Redis[(Redis Cache)]
    APIPods --> Storage[(File Storage)]
    
    Database --> DBPods[PostgreSQL Pods]
    Redis --> RedisPods[Redis Pods]
    Storage --> StoragePods[MinIO Pods]
\`\`\`

## Step 1: Namespace and Basic Setup

### Create Namespace
\`\`\`yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: panels
  labels:
    app.kubernetes.io/name: panels
    app.kubernetes.io/instance: production
---
apiVersion: v1
kind: Namespace
metadata:
  name: panels-system
  labels:
    app.kubernetes.io/name: panels-system
    app.kubernetes.io/instance: production
\`\`\`

### Apply Namespace
\`\`\`bash
kubectl apply -f k8s/namespace.yaml
\`\`\`

### Set Default Namespace
\`\`\`bash
kubectl config set-context --current --namespace=panels
\`\`\`

## Step 2: Configuration and Secrets

### ConfigMap for Application Config
\`\`\`yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: panels-config
  namespace: panels
data:
  NODE_ENV: "production"
  API_PORT: "3001"
  APP_PORT: "3000"
  DATABASE_HOST: "postgresql-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "panels"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  LOG_LEVEL: "info"
  CORS_ORIGIN: "*"
  RATE_LIMIT_REQUESTS: "100"
  RATE_LIMIT_WINDOW: "60000"
\`\`\`

### Secrets for Sensitive Data
\`\`\`yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: panels-secrets
  namespace: panels
type: Opaque
data:
  # Base64 encoded values
  DATABASE_PASSWORD: cGFuZWxzLXNlY3VyZS1wYXNzd29yZA==
  JWT_SECRET: c3VwZXItc2VjcmV0LWp3dC1rZXk=
  REDIS_PASSWORD: cmVkaXMtcGFzc3dvcmQ=
  ENCRYPTION_KEY: ZW5jcnlwdGlvbi1rZXktMzItY2hhcnM=
  API_SECRET_KEY: YXBpLXNlY3JldC1rZXktZm9yLWF1dGg=
---
apiVersion: v1
kind: Secret
metadata:
  name: database-credentials
  namespace: panels
type: Opaque
data:
  username: cGFuZWxz
  password: cGFuZWxzLXNlY3VyZS1wYXNzd29yZA==
---
apiVersion: v1
kind: Secret
metadata:
  name: redis-credentials
  namespace: panels
type: Opaque
data:
  password: cmVkaXMtcGFzc3dvcmQ=
\`\`\`

### External Secrets (if using external secret management)
\`\`\`yaml
# k8s/external-secrets.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: panels
spec:
  provider:
    vault:
      server: "https://vault.example.com"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "panels-role"
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: panels-vault-secrets
  namespace: panels
spec:
  refreshInterval: 15s
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: panels-external-secrets
    creationPolicy: Owner
  data:
  - secretKey: database-password
    remoteRef:
      key: panels/database
      property: password
  - secretKey: jwt-secret
    remoteRef:
      key: panels/auth
      property: jwt-secret
\`\`\`

## Step 3: Database Deployment

### PostgreSQL with Persistent Storage
\`\`\`yaml
# k8s/database.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgresql-pvc
  namespace: panels
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 20Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgresql
  namespace: panels
  labels:
    app: postgresql
    component: database
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
        component: database
    spec:
      containers:
      - name: postgresql
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: panels-config
              key: DATABASE_NAME
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: password
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        volumeMounts:
        - name: postgresql-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - panels
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - panels
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: postgresql-storage
        persistentVolumeClaim:
          claimName: postgresql-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql-service
  namespace: panels
  labels:
    app: postgresql
spec:
  ports:
  - port: 5432
    targetPort: 5432
  selector:
    app: postgresql
\`\`\`

### Database Initialization Job
\`\`\`yaml
# k8s/database-init.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: database-migration
  namespace: panels
spec:
  template:
    spec:
      containers:
      - name: migration
        image: panels/api:latest
        command: ["npm", "run", "migration:run"]
        env:
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: panels-config
              key: DATABASE_HOST
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: panels-secrets
              key: DATABASE_PASSWORD
        envFrom:
        - configMapRef:
            name: panels-config
      restartPolicy: OnFailure
      backoffLimit: 3
\`\`\`

## Step 4: Redis Cache Deployment

### Redis with Persistence
\`\`\`yaml
# k8s/redis.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: panels
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 5Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: panels
  labels:
    app: redis
    component: cache
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
        component: cache
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command:
        - redis-server
        - --requirepass
        - $(REDIS_PASSWORD)
        - --appendonly
        - "yes"
        - --dir
        - /data
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: password
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: panels
  labels:
    app: redis
spec:
  ports:
  - port: 6379
    targetPort: 6379
  selector:
    app: redis
\`\`\`

## Step 5: API Service Deployment

### API Deployment with HPA
\`\`\`yaml
# k8s/api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: panels-api
  namespace: panels
  labels:
    app: panels-api
    component: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: panels-api
  template:
    metadata:
      labels:
        app: panels-api
        component: backend
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: api
        image: panels/api:latest
        ports:
        - containerPort: 3001
          name: http
        env:
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: panels-secrets
              key: DATABASE_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: panels-secrets
              key: JWT_SECRET
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: password
        envFrom:
        - configMapRef:
            name: panels-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /liveness
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /healthz
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: tmp
        emptyDir: {}
      - name: logs
        emptyDir: {}
      securityContext:
        fsGroup: 1000
      serviceAccountName: panels-api
---
apiVersion: v1
kind: Service
metadata:
  name: panels-api-service
  namespace: panels
  labels:
    app: panels-api
spec:
  ports:
  - port: 80
    targetPort: 3001
    name: http
  selector:
    app: panels-api
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: panels-api-hpa
  namespace: panels
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: panels-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
\`\`\`

## Step 6: Frontend Deployment

### Frontend with Optimized Configuration
\`\`\`yaml
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: panels-frontend
  namespace: panels
  labels:
    app: panels-frontend
    component: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: panels-frontend
  template:
    metadata:
      labels:
        app: panels-frontend
        component: frontend
    spec:
      containers:
      - name: frontend
        image: panels/frontend:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "/api"
        - name: NEXT_PUBLIC_APP_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: nextjs-cache
          mountPath: /.next
      volumes:
      - name: tmp
        emptyDir: {}
      - name: nextjs-cache
        emptyDir: {}
      securityContext:
        fsGroup: 1000
---
apiVersion: v1
kind: Service
metadata:
  name: panels-frontend-service
  namespace: panels
  labels:
    app: panels-frontend
spec:
  ports:
  - port: 80
    targetPort: 3000
    name: http
  selector:
    app: panels-frontend
\`\`\`

## Step 7: Ingress and Load Balancing

### Ingress with TLS
\`\`\`yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: panels-ingress
  namespace: panels
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - panels.yourdomain.com
    - api.panels.yourdomain.com
    secretName: panels-tls
  rules:
  - host: panels.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: panels-api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: panels-frontend-service
            port:
              number: 80
  - host: api.panels.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: panels-api-service
            port:
              number: 80
\`\`\`

## Step 8: Deployment Automation with Helm

### Helm Chart Values
\`\`\`yaml
# helm/panels/values.yaml
global:
  imageRegistry: ""
  imagePullSecrets: []

api:
  image:
    repository: panels/api
    tag: latest
    pullPolicy: Always
  replicas: 3
  resources:
    requests:
      memory: 256Mi
      cpu: 250m
    limits:
      memory: 512Mi
      cpu: 500m

frontend:
  image:
    repository: panels/frontend
    tag: latest
    pullPolicy: Always
  replicas: 2
  resources:
    requests:
      memory: 128Mi
      cpu: 100m
    limits:
      memory: 256Mi
      cpu: 200m

postgresql:
  enabled: true
  auth:
    postgresPassword: ""
    database: panels
  primary:
    persistence:
      enabled: true
      size: 20Gi
      storageClass: fast-ssd

redis:
  enabled: true
  auth:
    enabled: true
    password: ""
  master:
    persistence:
      enabled: true
      size: 5Gi
      storageClass: fast-ssd

ingress:
  enabled: true
  className: nginx
  hosts:
  - host: panels.yourdomain.com
    paths:
    - path: /
      pathType: Prefix
  tls:
  - secretName: panels-tls
    hosts:
    - panels.yourdomain.com
\`\`\`

## Deployment Commands

### Using kubectl
\`\`\`bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/database.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
\`\`\`

### Using Helm
\`\`\`bash
# Deploy with Helm
helm install panels ./helm/panels \
  --namespace panels \
  --create-namespace \
  --values helm/panels/values-production.yaml
\`\`\`

### Zero-Downtime Updates
\`\`\`bash
# Rolling update
helm upgrade panels ./helm/panels \
  --set api.image.tag=v1.2.0 \
  --set frontend.image.tag=v1.2.0
\`\`\`

## Monitoring and Observability

### Prometheus Integration
\`\`\`yaml
# k8s/monitoring.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: panels-api-metrics
  namespace: panels
  labels:
    app: panels-api
spec:
  selector:
    matchLabels:
      app: panels-api
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
\`\`\`

## Security Best Practices

### Pod Security Standards
\`\`\`yaml
# k8s/security.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: panels
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: panels-network-policy
  namespace: panels
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  - from:
    - podSelector:
        matchLabels:
          app: panels-api
    - podSelector:
        matchLabels:
          app: panels-frontend
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to: []  # Allow DNS
    ports:
    - protocol: UDP
      port: 53
\`\`\`

## Backup and Disaster Recovery

### Database Backup CronJob
\`\`\`yaml
# k8s/backup.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: panels
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:16-alpine
            command:
            - /bin/bash
            - -c
            - |
              TIMESTAMP=$(date +%Y%m%d_%H%M%S)
              pg_dump -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME > /backup/panels_backup_$TIMESTAMP.sql
              # Upload to cloud storage
              aws s3 cp /backup/panels_backup_$TIMESTAMP.sql s3://panels-backups/
            env:
            - name: DATABASE_HOST
              valueFrom:
                configMapKeyRef:
                  name: panels-config
                  key: DATABASE_HOST
            - name: DATABASE_USER
              valueFrom:
                secretKeyRef:
                  name: database-credentials
                  key: username
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: database-credentials
                  key: password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            emptyDir: {}
          restartPolicy: OnFailure
\`\`\`

## Troubleshooting

### Common Issues

**Q: Pods stuck in Pending state**
\`\`\`bash
# Check resource constraints
kubectl describe pod <pod-name>
kubectl get nodes -o wide
kubectl top nodes
\`\`\`

**Q: Database connection failures**
\`\`\`bash
# Check database pod logs
kubectl logs -l app=postgresql
# Test connectivity
kubectl exec -it deployment/panels-api -- nc -zv postgresql-service 5432
\`\`\`

**Q: Ingress not working**
\`\`\`bash
# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
# Check certificate
kubectl describe certificate panels-tls
\`\`\`

## Best Practices

### Resource Management
- Set appropriate resource requests and limits
- Use HPA for automatic scaling
- Monitor resource usage with Prometheus
- Use node selectors for database workloads

### Security
- Use Pod Security Standards
- Implement Network Policies
- Scan images regularly
- Rotate secrets and certificates
- Use service mesh for mTLS

### High Availability
- Deploy across multiple availability zones
- Use pod disruption budgets
- Implement health checks
- Set up database replication
- Use persistent storage with backups

## Next Steps

- **[How to monitor on Kubernetes](./monitor-kubernetes.md)** - Set up comprehensive monitoring
- **[How to scale on Kubernetes](./scale-kubernetes.md)** - Advanced scaling strategies
- **[How to secure Kubernetes](./secure-kubernetes.md)** - Security hardening

## Related Topics

- **[Container security](../../guides/troubleshooting/container-security.md)** - Secure your containers
- **[Infrastructure automation](../../guides/deployment/infrastructure-automation.md)** - Automate deployments
- **[Disaster recovery](../../guides/deployment/disaster-recovery.md)** - Plan for failures
