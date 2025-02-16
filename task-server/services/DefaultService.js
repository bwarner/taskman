/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* create a task
* Adds a new task
*
* limit Integer the max number of tasks to return (optional)
* offset Integer The number of tasks to skip before starting to collect the result set. (optional)
* returns TaskPage
* */
const getTasks = ({ limit, offset }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        limit,
        offset,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
*
* createTaskInput CreateTaskInput 
* returns Task
* */
const tasksPOST = ({ createTaskInput }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        createTaskInput,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* remove the tasks if it has not has not remain executions
*
* taskId String The unique identifier of the tasks
* returns Task
* */
const tasksTaskIdDELETE = ({ taskId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        taskId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Read a task
*
* taskId String The unique identifier of the tasks
* returns Task
* */
const tasksTaskIdGET = ({ taskId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        taskId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* update the tasks if it has not has not remain executions
*
* taskId String The unique identifier of the tasks
* updateTaskInput UpdateTaskInput 
* returns Task
* */
const tasksTaskIdPUT = ({ taskId, updateTaskInput }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        taskId,
        updateTaskInput,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  getTasks,
  tasksPOST,
  tasksTaskIdDELETE,
  tasksTaskIdGET,
  tasksTaskIdPUT,
};
