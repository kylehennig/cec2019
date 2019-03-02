import { axios } from 'axios';

const url = 'http://cec2019.ca/'

class Server {
    /**
     * Connects to the server.
     */
    init() {
        getInstance();
    }

    /**
     * Gets the current instance.
     */
    getInstance() {
        axios.post(url + '/instance')
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Disconnects from the current instance.
     */
    finish() {
        axios.post(url + '/finish')
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Turns the robot to face the specified direction.
     * @param {string} direction 
     */
    turn(direction) {
        if (!['N', 'E', 'S', 'W'].includes(direction)) {
            console.log('Error: invalid direction.');
            return;
        }
        axios.post(url + `/finish/${direction}`)
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Moves one block forward.
     */
    move() {
        axios.post(url + '/move')
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Scans for nearby trash.
     */
    scanArea() {
        axios.post(url + '/scanArea')
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Collects a previously scanned item.
     * @param {number} id The item's id.
     */
    collectItem(id) {
        axios.post(url + `/collectItem/${id}`)
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Unloads an item.
     * Requires the robot is at the proper disposal bin.
     * @param {number} id The item's id.
     */
    unloadItem(id) {
        axios.post(url + `/unloadItem/${id}`)
            .then(_onResponse)
            .catch(_onError);
    }

    _onResponse(response) {
        if (response.data.type === 'ERROR') {

        } else if (response.data.type === 'FAILURE') {

        } else if (response.data.type === 'SUCCESS') {

        }
    }

    _onError(error) {
        console.log(error);
    }
}

exports.Server = Server;
