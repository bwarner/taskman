# Taskman - A Distributed Task Running Application

## Overview 

**Taskman** is a **distributed task runner** that enables running and scheduling tasks across multiple machines. It supports **one-time and recurring tasks**, provides **real-time status updates**, and ensures **task durability** even if the system restarts.

## Features & Objectives

- ✅ **Task Scheduling**: Supports one-time and recurring tasks.
- ⏳ **Cron Scheduling**: Tasks can be scheduled using cron expressions.
- 📊 **UI Monitoring**: View task status and logs in a web interface.
- 🔄 **Durability**: Tasks persist and resume even after a server restart.
- 🌍 **Distributed Execution**: Tasks can be executed across multiple worker nodes.
- 📈 **Scalability**: Can scale across multiple machines behind a load balancer.

## Architecture

Taskman consists of the following components:

- **Backend Server** (includes workers)
- **Frontend Server**
- **Watchdog Server**
- **Redis Server** (Task storage and pub/sub for real-time events)

### **1. Backend Server (Workers)**
The **backend server** is responsible for processing and executing tasks. It listens for tasks from the frontend server and executes them. 

💡 *For simplicity, the workers and backend API are hosted in a single server.*

### **2. Frontend Server**
The **frontend server** provides a UI for managing tasks. It communicates with the backend via a **REST API** and **Server-Sent Events (SSE)** for real-time updates.

### **3. Watchdog Server**
The **watchdog server** ensures reliability by:
- Detecting **stalled or failed tasks**
- Restarting long-running or stuck jobs
- Keeping track of scheduled execution times
- Instead of separate server its an interval timer that runs on the backend server

### **4. Redis (Task Storage & Pub/Sub)**
Redis is used to:
- Store **task metadata and logs**
- Maintain a **sorted set** of scheduled tasks
- Use **Pub/Sub** to send task updates in real-time
- Ensure **fault tolerance and durability**

💡 *Currently, Taskman uses a **single Redis instance** instead of a cluster due to setup issues, but Redis Cluster support is planned for future scalability.*

## Taskman API

The **Taskman API** is a **RESTful API** that facilitates communication between the frontend and backend. It allows:
- 📩 Submitting tasks for execution
- 🔍 Fetching task status and logs
- 🔔 Receiving real-time updates via **SSE + Redis Pub/Sub**

## How to Run the Application

### 1️⃣ Clone the repository
```sh
git clone https://github.com/yourusername/taskman.git
cd taskman
```

### 2️⃣ Add task-server to your /etc/hosts file
```sh
echo "127.0.0.1 task-server" | sudo tee -a /etc/hosts
```

### 3️⃣ Run the application
```sh
docker compose up --build
```

### 4️⃣ Access the application
```sh
http://localhost:3000
```

### 5️⃣ Check the health of the application
```sh
curl http://localhost:8080/health
```

### 6️⃣ Check the health of the frontend application
```sh
curl http://localhost:3000/healthcheck
```
Note: there bug, the edit task page does not navigate to the task list page after editing a task.
you have to manually navigate to the task list page.