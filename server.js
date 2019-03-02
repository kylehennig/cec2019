import axios from 'axios';

const url = 'http://cec2019.ca/';
const token = 'alberta-77hXNVY9CfBT8jvzU5oNPHHn2EVFTbdUVP5CYzBUQ9Fmz5GbD2T8NqXh7b9nXwmQ';

class Server {
    /**
     * Connects to the server.
     * @returns {Promise} A promise resolving to the payload object.
     */
    async init() {
        return this.getInstance();
    }

    /**
     * Gets the current instance.
     * @returns {Promise} A promise resolving to the payload object.
     */
    async getInstance() {
        return axios.post(url + '/instance', { headers: this._createHeaders() })
            .then(this._onResponse)
            .catch(this._onError);
    }

    /**
     * Disconnects from the current instance.
     */
    finish() {
        axios.post(url + '/finish', { headers: this._createHeaders() })
            .then(this._onResponse)
            .catch(this._onError);
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
        axios.post(url + `/finish/${direction}`, { headers: this._createHeaders() })
            .then(this._onResponse)
            .catch(this._onError);
    }

    /**
     * Moves one block forward.
     */
    move() {
        axios.post(url + '/move', { headers: this._createHeaders() })
            .then(this._onResponse)
            .catch(this._onError);
    }

    /**
     * Scans for nearby trash.
     */
    scanArea() {
        axios.post(url + '/scanArea', { headers: this._createHeaders() })
            .then(this._onResponse)
            .catch(this._onError);
    }

    /**
     * Collects a previously scanned item.
     * @param {number} id The item's id.
     */
    collectItem(id) {
        axios.post(url + `/collectItem/${id}`, { headers: this._createHeaders() })
            .then(this._onResponse)
            .catch(this._onError);
    }

    /**
     * Unloads an item.
     * Requires the robot is at the proper disposal bin.
     * @param {number} id The item's id.
     */
    unloadItem(id) {
        axios.post(url + `/unloadItem/${id}`, { headers: this._createHeaders() })
            .then(this._onResponse)
            .catch(this._onError);
    }

    _createHeaders() {
        return {
            'Content-Type': 'application/json',
            'token': token
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

export default Server;
