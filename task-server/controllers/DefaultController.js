/**
 * The DefaultController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/DefaultService');
const getTasks = async (request, response) => {
  await Controller.handleRequest(request, response, service.getTasks);
};

const tasksPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.tasksPOST);
};

const tasksTaskIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.tasksTaskIdDELETE);
};

const tasksTaskIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.tasksTaskIdGET);
};

const tasksTaskIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, service.tasksTaskIdPUT);
};


module.exports = {
  getTasks,
  tasksPOST,
  tasksTaskIdDELETE,
  tasksTaskIdGET,
  tasksTaskIdPUT,
};
