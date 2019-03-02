import { axios } from 'axios';

const url = 'http://cec2019.ca/'

/**
 * Creates a new instance.
 */
function createInstance() {
    axios.post(url + '/instance')
        .then(onResponse)
        .catch(onError);
}

/**
 * Disconnects from the current instance.
 */
function finish() {
    axios.post(url + '/finish')
        .then(onResponse)
        .catch(onError);
}

/**
 * Turns the robot to face the specified direction.
 * @param {string} direction 
 */
function turn(direction) {
    if (!['N', 'E', 'S', 'W'].includes(direction)) {
        console.log('Error: invalid direction.');
        return;
    }
    axios.post(url + `/finish/${direction}`)
        .then(onResponse)
        .catch(onError);
}

/**
 * Moves one block forward.
 */
function move() {
    axios.post(url + '/move')
        .then(onResponse)
        .catch(onError);
}

/**
 * Scans for nearby trash.
 */
function scanArea() {
    axios.post(url + '/scanArea')
        .then(onResponse)
        .catch(onError);
}

/**
 * Collects a previously scanned item.
 * @param {number} id The item's id.
 */
function collectItem(id) {
    axios.post(url + `/collectItem/${id}`)
        .then(onResponse)
        .catch(onError);
}

/**
 * Unloads an item.
 * Requires the robot is at the proper disposal bin.
 * @param {number} id The item's id.
 */
function unloadItem(id) {
    axios.post(url + `/unloadItem/${id}`)
        .then(onResponse)
        .catch(onError);
}

function onResponse(response) {
    if (response.data.type === 'ERROR') {

    } else if (response.data.type === 'FAILURE') {

    } else if (response.data.type === 'SUCCESS') {

    }
}

function onError(error) {
    console.log(error);
}
