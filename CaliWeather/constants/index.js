const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;  //no need to import from .env file in expo router


export const weatherImages = {
    'Partly cloudy': require('../assets/images/partlycloudy.png'),
    'Moderate rain': require('../assets/images/moderaterain.png'),
    'Patchy rain possible': require('../assets/images/moderaterain.png'),
    'Sunny': require('../assets/images/sun.png'),
    'Clear': require('../assets/images/sun.png'),
    'Overcast': require('../assets/images/cloud.png'),
    'Cloudy': require('../assets/images/cloud.png'),
    'Light rain': require('../assets/images/moderaterain.png'),
    'Moderate rain at times': require('../assets/images/moderaterain.png'),
    'Heavy rain': require('../assets/images/heavyrain.png'),
    'Heavy rain at times': require('../assets/images/heavyrain.png'),
    'Moderate or heavy freezing rain': require('../assets/images/heavyrain.png'),
    'Moderate or heavy rain shower': require('../assets/images/heavyrain.png'),
    'Moderate or heavy rain with thunder': require('../assets/images/heavyrain.png'),
    'other': require('../assets/images/moderaterain.png')
}

//this file is different fron index.tsx in app/
//explanation of this file:
// role: A Data Module(small, self-contained piece of code that performs a specific task or provides a set of related functions)
// Purpose: This file is just for storing and exporting data. It has no visual output and is not a screen. It's a helper file that other files (like your screen) can import data from.
// Content: Contains JavaScript variables, objects, and values that are meant to be shared across your app.