import { API_HOLIDAYS_URL, API_KEY } from './constants.js';

export class HolidaysAPI {
    #apiKey;
    #apiUrl;
    
    constructor() {
        this.#apiKey = API_KEY;
        this.#apiUrl = API_HOLIDAYS_URL;        
    }

    getData = async (country, year) => {
        try {
            const response = await fetch(`${this.#apiUrl}?api_key=${this.#apiKey}&country=${country}&year=${year}`);
            return await response.json();            
        } catch (error) {
            throw new Error(error);
        }
    }   
}
