# Taskman - a distribute task running application

## Overview 

Taskman is a distributed task running application. It is am simple system that allows you to run tasks on a distributed system.

## Objectives

- To provide a simple system for running tasks
- The tasks can be scheduled to run onetime or recurring
- The task can be scheduled to run on a specific cron schedule
- The status of the task can be viewed in the UI
- The task logs can be viewed in the UI
- The tasks are durable, meaning that they will run even if the Taskman server is restarted
- The tasks are distributed, meaning that they will be run on different machines
- The tasks are scalable, meaning that they can be run on a large number of machines
  
## Architecture

The system is composed of the following components: worker nodes, front-end server, a watchdog server, and a Redis server.

### Worker Nodes

The worker nodes are responsible for running the tasks. They are responsible for listening for tasks from the front-end server and executing them.

### Front-end Server

The front-end server is responsible for sending tasks to the worker nodes and receiving the results.

### Watchdog Server

The watchdog server is responsible for monitoring the state of tasks, it will notice things like tasks that have been scheduled to run but not started, or tasks that have been running for too long.

### Redis 

Redis is used to store the state of the tasks, it is used to store the task queue, the task results, and the task logs.

### Taskman API

The Taskman API is a REST API that is used to communicate between the front-end server and the worker nodes. It is used to send tasks to the worker nodes and receive the results. For simplicity the works will host the API.

The API will be used by the front-end server to send tasks to the worker nodes and receive the results.








