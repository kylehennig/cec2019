import { axios } from 'axios';

const url = 'http://cec2019.ca/';
const token = 'alberta-77hXNVY9CfBT8jvzU5oNPHHn2EVFTbdUVP5CYzBUQ9Fmz5GbD2T8NqXh7b9nXwmQ';

class Server {
    /**
     * Connects to the server.
     * @returns {Promise} A promise resolving to the payload object.
     */
    async init() {
        return getInstance();
    }

    /**
     * Gets the current instance.
     * @returns {Promise} A promise resolving to the payload object.
     */
    async getInstance() {
        return axios.post(url + '/instance', { headers: _createHeaders() })
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Disconnects from the current instance.
     */
    finish() {
        axios.post(url + '/finish', { headers: _createHeaders() })
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
        axios.post(url + `/finish/${direction}`, { headers: _createHeaders() })
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Moves one block forward.
     */
    move() {
        axios.post(url + '/move', { headers: _createHeaders() })
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Scans for nearby trash.
     */
    scanArea() {
        axios.post(url + '/scanArea', { headers: _createHeaders() })
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Collects a previously scanned item.
     * @param {number} id The item's id.
     */
    collectItem(id) {
        axios.post(url + `/collectItem/${id}`, { headers: _createHeaders() })
            .then(_onResponse)
            .catch(_onError);
    }

    /**
     * Unloads an item.
     * Requires the robot is at the proper disposal bin.
     * @param {number} id The item's id.
     */
    unloadItem(id) {
        axios.post(url + `/unloadItem/${id}`, { headers: _createHeaders() })
            .then(_onResponse)
            .catch(_onError);
    }

    _createHeaders() {
        return {
            'Content-Type': 'application/json',
            'token': apiKey
        };
    }

    _onResponse(response) {
        if (response.data.type === 'ERROR') {
            console.log(response.data.error);
            console.log(response.data.message);
        } else if (response.data.type === 'FAILURE') {
            console.log(response.data.failure);
            console.log(response.data.message);
        } else if (response.data.type === 'SUCCESS') {
            return response.data.payload;
        }
    }

    _onError(error) {
        console.log(error);
    }
}

exports.Server = Server;
