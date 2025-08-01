// src/services/apiService.js

const axios = require('axios');

class ApiService {
    async fetchData(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching data: ' + error.message);
        }
    }

    async postData(url, data) {
        try {
            const response = await axios.post(url, data);
            return response.data;
        } catch (error) {
            throw new Error('Error posting data: ' + error.message);
        }
    }
}

module.exports = ApiService;