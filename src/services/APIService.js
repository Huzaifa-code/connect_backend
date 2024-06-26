const axios = require('axios').default;

// A service class for all REST API operations
class APIService {
    #axiosInstance;
    #tokenServiceInstance
    constructor(tokenService) {
        // Set Axios baseURL to 100ms API BaseURI
        this.#axiosInstance = axios.create(
            {
                baseURL: "https://api.100ms.live/v2",
                timeout: 3 * 60000
            });
        this.#tokenServiceInstance = tokenService;
        this.#configureAxios();
    }

    // Add Axios interceptors to process all requests and responses
    #configureAxios() {
        this.#axiosInstance.interceptors.request.use((config) => {
            // Add Authorization on every request made using the Management token
            config.headers = {
                Authorization: `Bearer ${this.#tokenServiceInstance.getManagementToken()}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            };
            return config;
        },
            (error) => Promise.reject(error));
        this.#axiosInstance.interceptors.response.use((response) => {
            return response;
        },
            (error) => {
                console.error("Error in making API call", { response: error.response?.data });
                const originalRequest = error.config;
                if (
                    (error.response?.status === 403 || error.response?.status === 401) &&
                    !originalRequest._retry
                ) {
                    console.log("Retrying request with refreshed token");
                    originalRequest._retry = true;

                    // Force refresh Management token on error making API call
                    this.axios.defaults.headers.common["Authorization"] = "Bearer " + this.#tokenServiceInstance.getManagementToken(true);
                    try {
                        return this.axios(originalRequest);
                    } catch (error) {
                        console.error("Unable to Retry!");
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // A method for GET requests using the configured Axios instance
    async get(path, queryParams) {
        const res = await this.#axiosInstance.get(path, { params: queryParams });
        console.log(`get call to path - ${path}, status code - ${res.status}`);
        return res.data;
    }

    // A method for POST requests using the configured Axios instance
    async post(path, payload) {
        const res = await this.#axiosInstance.post(path, payload || {});
        console.log(`post call to path - ${path}, status code - ${res.status}`);
        return res.data;
    }

    
}

module.exports = {APIService};