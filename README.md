# Todo App - Kubernetes / Minikube

Application web Todo App deployee sur Kubernetes avec Minikube.  
Architecture 3-tiers : **Frontend** (Nginx) + **Backend** (Flask) + **PostgreSQL**.

## Architecture

```
Navigateur (localhost:8080)
    |
    v
Frontend (Nginx) ──proxy /api/──> Backend (Flask :5000)
                                        |
                                        v
                                  PostgreSQL (:5432)
```

## Structure du projet

```
todo-k8s-app/
├── frontend/
│   ├── Dockerfile         # Image Nginx Alpine
│   ├── index.html         # Interface web
│   ├── app.js             # Logique JS (fetch API)
│   └── nginx.conf         # Reverse proxy vers le backend
├── backend/
│   ├── Dockerfile         # Image Python 3.12
│   ├── requirements.txt   # Flask, psycopg2, flask-cors
│   └── main.py            # API REST GET/POST /tasks
└── k8s/
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secret.yaml
    ├── postgres-pvc.yaml
    ├── postgres-deployment.yaml
    ├── postgres-service.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    └── frontend-service.yaml
```

## Ressources Kubernetes utilisees

| Ressource | Fichier | Role |
|---|---|---|
| **Namespace** | `namespace.yaml` | Isole toutes les ressources dans l'espace `todo-app` |
| **ConfigMap** | `configmap.yaml` | Stocke la configuration non sensible (DB_HOST, DB_NAME, DB_USER, DB_PORT) |
| **Secret** | `secret.yaml` | Stocke le mot de passe PostgreSQL en base64 (pas en clair) |
| **PersistentVolumeClaim** | `postgres-pvc.yaml` | Reserve 1Gi de stockage persistant pour les donnees PostgreSQL |
| **Deployment postgres** | `postgres-deployment.yaml` | Deploie un pod PostgreSQL 16 avec volume persistant |
| **Service postgres** | `postgres-service.yaml` | Service interne (ClusterIP) pour que le backend accede a PostgreSQL |
| **Deployment backend** | `backend-deployment.yaml` | Deploie l'API Flask qui communique avec PostgreSQL |
| **Service backend** | `backend-service.yaml` | Service interne (ClusterIP) pour que le frontend proxy vers l'API |
| **Deployment frontend** | `frontend-deployment.yaml` | Deploie Nginx qui sert le HTML/JS et proxy les appels API |
| **Service frontend** | `frontend-service.yaml` | Service interne (ClusterIP) expose via port-forward |

## Deploiement

### Prerequis

- Docker Desktop
- Minikube
- kubectl

### Lancer l'application

```bash
# Demarrer Minikube
minikube start --driver=docker

# Construire les images
minikube image build -t todo-frontend:1.0 ./frontend
minikube image build -t todo-backend:1.0 ./backend

# Deployer les ressources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Acceder a l'application
kubectl port-forward -n todo-app service/frontend-service 8080:80
```

L'application est accessible sur **http://localhost:8080**.

## Commandes de verification

```bash
kubectl get all -n todo-app
kubectl get pvc -n todo-app
kubectl get configmap -n todo-app
kubectl get secret -n todo-app
```

### Tester le backend

```bash
kubectl port-forward -n todo-app service/backend-service 5000:5000
curl http://localhost:5000/tasks
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Apprendre Kubernetes"}'
```

## Nettoyage

```bash
kubectl delete namespace todo-app
minikube stop
```
