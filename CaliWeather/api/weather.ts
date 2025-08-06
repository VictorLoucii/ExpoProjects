import axios from 'axios';

//WeatherAPI, the aqi (Air Quality Index) parameter is not a number — it is a string that can be either:
// 'yes' → to include air quality data in the response
// 'no' → to exclude air quality data

// interface WeatherApiParams {
//     cityName: string;
//     aqi?: 'yes' | 'no';
//     alerts?: 'yes' | 'no';
// }

const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;  //no need to import from .env file in expo router


const currentEndpoint = (params) => `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${params.cityName}&aqi=${params.aqi}`

// Allow 'days' to be passed in params, with a default of 7
const forecastEndpoint = params => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days || 7}&aqi=${params.aqi}&alerts=${params.alerts}`


const searchEndPoint = params => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`  //* The `search.json` endpoint returns **an array** of city/location matches based on what the user types


const alertsEndPoint = params => `https://api.weatherapi.com/v1/alerts.json?key=${apiKey}&q=${params.cityName}`


const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint,
    }
    try {
        const response = await axios.request(options);
        return response.data;

    }
    catch (e) {
        console.log('error:---', e);
        return null;
    }
}


//get current weather info
export const fetchCurrentWeather = params => {
    return apiCall(currentEndpoint(params));
}


// Get future weather info (this could stay search for now, or use forecast)
export const fetchFutureWeather = params => {
    return apiCall(forecastEndpoint(params));
}

// Get matching location suggestions
export const fetchLocations = params => {
    return apiCall(searchEndPoint(params));
}

// get weather alerts info
export const fetchAlerts = params => {
    return apiCall(alertsEndPoint(params));
}