import { API_COUNTRY_URL, API_KEY } from './constants.js';

export class CountryAPI {
    #apiKey;
    #apiUrl;
    
    constructor() {
        this.#apiKey = API_KEY;
        this.#apiUrl = API_COUNTRY_URL;        
    }

    getData = async () => {
        try {
            const response =                
                await fetch(`${this.#apiUrl}?api_key=${this.#apiKey}`);
            return await response.json();            
        } catch (error) {
            throw new Error(error);
        }
    }
}