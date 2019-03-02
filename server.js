import axios from 'axios';

const url = 'http://cec2019.ca/';
const token = 'alberta-77hXNVY9CfBT8jvzU5oNPHHn2EVFTbdUVP5CYzBUQ9Fmz5GbD2T8NqXh7b9nXwmQ';

class Server {
    constructor() {
        this._queue = [];
    }

    /**
     * Connects to the server.
     * @returns {Promise} A promise resolving to the payload object.
     */
    async init() {
        setInterval(this._dispatch.bind(this), 500);
        return new Promise((resolve, reject) => {
            this._queue.push(() => {
                this._post(url + 'instance')
                    .then(this._onResponse)
                    .then(payload => resolve(payload))
                    .catch(error => {
                        this._onError(error);
                        reject();
                    });
            });
        });
    }

    /**
     * Gets the current instance.
     * @returns {Promise} A promise resolving to the payload object.
     */
    async getInstance() {
        return new Promise((resolve, reject) => {
            this._queue.push(() => {
                this._get(url + 'instance')
                    .then(this._onResponse)
                    .then(payload => resolve(payload))
                    .catch(error => {
                        this._onError(error);
                        reject();
                    });
            });
        });
    }

    /**
     * Deletes the current instance,
     */
    deleteInstance() {
        this._queue = [];
        this._delete(url + "instance");
    }

    /**
     * Finishes the current instance.
     */
    finish() {
        this._queue.push(() => {
            this._post(url + 'finish')
                .then(this._onResponse)
                .catch(this._onError);
        });
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
        this._queue.push(() => {
            this._post(url + `turn/${direction}`)
                .then(this._onResponse)
                .catch(this._onError);
        });
    }

    /**
     * Moves one block forward.
     */
    move() {
        this._queue.push(() => {
            this._post(url + 'move')
                .then(this._onResponse)
                .catch(this._onError);
        });
    }

    /**
     * Scans for nearby trash.
     */
    scanArea() {
        this._queue.push(() => {
            this._post(url + 'scanArea')
                .then(this._onResponse)
                .catch(this._onError);
        });
    }

    /**
     * Collects a previously scanned item.
     * @param {number} id The item's id.
     */
    collectItem(id) {
        this._queue.push(() => {
            this._post(url + `collectItem/${id}`)
                .then(this._onResponse)
                .catch(this._onError);
        });
    }

    /**
     * Unloads an item.
     * Requires the robot is at the proper disposal bin.
     * @param {number} id The item's id.
     */
    unloadItem(id) {
        this._queue.push(() => {
            this._post(url + `unloadItem/${id}`)
                .then(this._onResponse)
                .catch(this._onError);
        });
    }

    _createHeaders() {
        return {
            'Content-Type': 'application/json',
            'token': token
        };
    }

    _get(url) {
        return axios({
            method: 'get',
            url: url,
            headers: this._createHeaders()
        });
    }

    _post(url) {
        return axios({
            method: 'post',
            url: url,
            headers: this._createHeaders()
        });
    }

    _delete(url) {
        return axios({
            method: 'delete',
            url: url,
            headers: this._createHeaders()
        });
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

    _dispatch() {
        if (this._queue.length > 0) {
            this._queue.pop()();
        }
    }
}

export default Server;
