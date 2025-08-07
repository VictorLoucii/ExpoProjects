// defining FC Home Screen in file index.tsx

import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useCallback, useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from 'lodash';
import { fetchCurrentWeather, fetchFutureWeather, fetchLocations } from '@/api/weather';
import { weatherImages } from '../constants/index.js';
import { getData, storeData } from '@/utils/asyncStorage.js'
import * as Location from 'expo-location';



export default function HomeScreen() {

  const [showSearch, toggleSearch] = useState(false);
  // const [locations, setLocations] = useState([1, 2, 3]);  //dummy array data for testing at start
  const [locations, setLocations] = useState([]);  //actual data array
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);



  const insets = useSafeAreaInsets();

  const handleLocation = (loc: any) => {
    console.log('loc: ', loc);
    setLocations([]); //clear/empty the array
    toggleSearch(false);
    setLoading(true); // <-- Set loading to true here

    fetchFutureWeather({
      cityName: loc.name,
      days: '7',
    }).then((data) => {
      console.log('data:----', data);
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);  //this will store the data in async storage where 'city' will be the key and loc.name will be its value

    })

  }

  const handleSearch = (value) => {
    console.log('value:---', value);
    if (value.length > 2) {    //validity check

      fetchLocations({ cityName: value }).then(data => {
        console.log('data:----', data);
        setLocations(data); //after this locations will contain this array data objects 
      })

    }

  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []); //note: only call the handleSearch after it's been defined, also [] → means the function will be created once and never re-created unless the component unmounts/remounts

  const { current, location } = weather;  //destructuring


  const handleCurrentLocation = async () => {
    setLoading(true); // Show loading indicator

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // Maybe show an alert to the user here
      setLoading(false);
      console.log("Permission to access location was denied");
      return;
    }

    // Get Coordinates
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Reverse Geocode the coordinates to get an address
    let address = await Location.reverseGeocodeAsync({ latitude, longitude });
    // LINE FOR DEBUGGING 
    // console.log("Full Address Object:", address[0]);

    //  CUSTOM NAMING LOGIC TO MATCH my location FORMAT 
    let customLocationName = 'Current Location'; // A fallback default
    if (address && address[0]) {
      const addr = address[0];

      // Split the formattedAddress string into an array of its parts
      const addressParts = addr.formattedAddress ? addr.formattedAddress.split(', ') : [];

      // Extract the specific part you need (e.g., "moti lal village")
      // In your example, it's the second part of the formatted address.
      const villageOrArea = addressParts.length > 1 ? addressParts[1] : null;

      // Build an array with all the desired components
      const locationComponents = [
        addr.name,          // this will be house address
        villageOrArea,      // street name
        addr.district,      // colony name
        // addr.postalCode,    // pin code
        // addr.country        // country name
      ];

      // Join the components that actually exist and convert to lowercase
      customLocationName = locationComponents
        .filter(Boolean) // This removes any null or undefined parts
        .join(', ')
        .toLowerCase();
    }
    // --- END OF LOGIC ---

    //Fetch weather using the accurate coordinates
    fetchFutureWeather({
      cityName: `${latitude},${longitude}`,
      days: '7',
    }).then(data => {
      // Update the weather data, but OVERWRITE the location name with your specific one
      if (data) {
        const updatedData = {
          ...data,
          location: {
            ...data.location,
            // Use our custom name but keep the country from the API for the sub-text
            name: customLocationName,
            country: data.location.country,
          },
        };
        setWeather(updatedData);
        setLoading(false);
        storeData('city', customLocationName);
      }
      else {
        setLoading(false); // case where data fetch fails
      }
    });

  };

  // simple function to fetch weather by city name
  const fetchWeatherByCityName = (cityName, days = '7') => {
    fetchFutureWeather({
      cityName,
      days,
    }).then((data) => {
      if (data) {
        setWeather(data);
        storeData('city', data.location.name); // Store the potentially updated name
      }
      setLoading(false); 
    });
  };

  useEffect(() => {
    const loadInitialData = async () => {
      // Load the last saved city from async storage
      let myCity = await getData('city');
      let cityName = myCity || 'New Delhi'; // Use stored city or default to 'New Delhi'

      // Set loading to true and IMMEDIATELY fetch weather for the cached city
      // This will make the app feel instant by showing the last known data.
      setLoading(true);
      fetchWeatherByCityName(cityName); // Use helper function 'fetchWeatherByCityName'

      //in the background, try to get the user's current location for fresh data
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // If permission is granted, call the handleCurrentLocation function you already built.
        // This will run in the background and update the UI with fresh, reverse-geocoded data when it's ready.
        // Note: We don't need to call setLoading(true) here again because it was already set.
        handleCurrentLocation();
      }
    };

    loadInitialData();
  }, []);



  return (
    <View className='flex-1 relative'>
      <StatusBar style="light" />
      {/* Background Image */}
      <Image
        blurRadius={70}   //this applies a heavy Gaussian blur to it
        source={require('../assets/images/bg.png')}
        className="absolute h-full w-full"
      />
      <SafeAreaView
        className='flex-1'
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >

        {/* search section */}
        <View style={{ height: '7%' }} className="mx-4 relative z-50">

          {/* The Search Bar Itself (<View>) which contains text input field and the icon */}
          <View className="flex-row justify-end items-center rounded-full overflow-hidden"
            // By adding overflow-hidden to the parent container, you are enforcing its rounded-full shape onto all of its children. The sharp corners of the TextInput that were previously spilling out will now be clipped, revealing the beautiful rounded corners of your search bar.
            style={{ backgroundColor: showSearch ? Colors.theme.bgWhite(0.2) : 'transparent' }}
          >
            {/* conditional rendering of the search input field */}
            {
              showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder='enter the city name here'
                  placeholderTextColor={'lightgray'}
                  className='pl-6 h-10 flex-1 text-base text-white rounded-full'
                />
              ) : null
            }

            {/* search icon */}
            <TouchableOpacity
              onPress={() => toggleSearch(!showSearch)}
              style={{ backgroundColor: Colors.theme.bgWhite(0.3) }}
              className='rounded-full p-3 m-1'
            >
              <MagnifyingGlassIcon size={25} color={'white'} />
            </TouchableOpacity>
          </View>

          {/* below is 'search results' statements make it sibling of the search container otherwise it won't be visible due to native wind styling prop : oveflow-hidden */}
          {
            locations.length > 0 && showSearch ? (
              <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>

                {
                  locations.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : ''
                    return (
                      // Add prop 'key' to the TouchableOpacity for proper list rendering when using with map function
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={'flex-row items-center p-3 px-4 mb-1 ' + borderClass}
                      >
                        <MapPinIcon size={20} color={'gray'} />

                        <Text className='text-black text-lg ml-2'>
                          {loc?.name + ", " + loc?.country}
                        </Text>
                      </TouchableOpacity>

                    )
                  })

                }
              </View>

            ) : null
          }
        </View>
        {/* search section ends here */}


        {
          loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>

          ) : (
            //note: Use a React Fragment <> to wrap multiple components 
            <>

              {/* 
              Adding a conditional render here.
              Only render the forecast sections if 'weather' and 'current' have data.
              */}
              {
                current && weather ? (
                  //note: Use a React Fragment <> to wrap multiple components 
                  <>
                    {/* forecast section */}
                    < View className='mx-4 justify-around flex-1 mb-2'>

                      {/* location */}
                      <Text className='text-white text-center text-2xl font-bold'>
                        {location?.name + ", "}
                        <Text className='text-lg font-semibold text-gray-300'>
                          {location?.country}
                        </Text>
                      </Text>

                      {/* weather image */}
                      <View className='flex-row justify-center'>
                        <Image
                          // source={require('../assets/images/partlycloudy.png')}
                          // source={{ uri: 'https:' + current?.condition?.icon }}  //getting icon from weahter api
                          source={weatherImages[current?.condition?.text] || weatherImages['other']}
                          className='w-52 h-52'
                        />
                      </View>

                      {/* Geolocation Icon, positioned absolutely */}
                      <TouchableOpacity
                        onPress={handleCurrentLocation}
                        className="absolute top-1/3 right-2 rounded-full p-1" // Position relative to the parent View
                        style={{ transform: [{ translateY: -15 },], backgroundColor: Colors.theme.bgWhite(0.3) }} // Fine-tune vertical centering

                      >
                        <MapPinIcon size={30} color={'white'} />
                      </TouchableOpacity>



                      {/* degreee/celsius data */}
                      <View className='space-y-2'>
                        <Text className='text-center font-bold text-white text-6xl ml-5'>
                          {/* below #176;  gives degree symbol */}
                          {current?.temp_c}&#176;
                        </Text>
                        <Text className='text-center text-white text-xl tracking-widest font-bold pt-2'>
                          {/* below #176;  gives degree symbol */}
                          {current?.condition?.text}
                        </Text>
                      </View>

                      {/* other statistics (wind speed and humidity)*/}
                      <View className='flex-row justify-between mx-4 mt-1'>

                        <View className='flex-row space-x-2 items-center'>
                          <Image
                            source={require('../assets/icons/wind.png')}
                            className='h-6 w-6'
                          />
                          <Text className='text-white font-semibold text-base ml-2'>
                            {current?.wind_kph + " "}km/hr
                          </Text>
                        </View>
                        <View className='flex-row space-x-2 items-center'>
                          <Image
                            source={require('../assets/icons/humidity.png')}
                            className='h-6 w-6'
                          />
                          <Text className='text-white font-semibold text-base ml-2'>
                            {current?.humidity}%
                          </Text>
                        </View>
                      </View>

                      {/* other statistics (sunrise and sunset)*/}
                      <View className='flex-row justify-between mx-4'>

                        <View className='flex-row space-x-2 items-center'>
                          <Image
                            source={require('../assets/icons/sunrise.png')}
                            className='h-10 w-10'
                          />
                          <Text className='text-white font-semibold text-base ml-2'>
                            {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                          </Text>
                        </View>
                        <View className='flex-row space-x-2 items-center'>
                          <Image
                            source={require('../assets/icons/sunset-.png')}
                            className='h-10 w-10'
                          />
                          <Text className='text-white font-semibold text-base ml-2'>
                            {weather?.forecast?.forecastday[0]?.astro?.sunset}
                          </Text>
                        </View>
                      </View>

                    </View>

                    {/* forecast section for future days */}
                    <View className='mb-2 space-y-3 mt-6'>
                      <View className='flex-row justify-center'>
                        <View
                          className='flex-row items-center mx-5 space-x-2 justify-center h-9 rounded-full px-4'
                          style={{ backgroundColor: Colors.theme.bgWhite(0.15) }}
                        >
                          <CalendarDaysIcon size={22} color={'white'} />
                          <Text className='text-white text-base ml-2'>
                            Daily Forecast
                          </Text>
                        </View>

                      </View>

                      <ScrollView
                        horizontal={true}
                        contentContainerStyle={{
                          paddingHorizontal: 15,
                          marginTop: 30,
                        }}
                        showsHorizontalScrollIndicator={false}
                      >

                        {
                          weather?.forecast?.forecastday?.map((item, index) => {
                            // Creating a Date object from the API's date string
                            const date = new Date(item.date);
                            // console.log('date:', date);
                            // Format the date to get the short day name (e.g., "Mon")
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            // console.log('dayName:', dayName);

                            return (
                              <View
                                key={index}
                                className='justify-center items-center w-24 rounded-3xl py-3 spacing-y-1 mr-4'
                                style={{ backgroundColor: Colors.theme.bgWhite(0.15) }}
                              >
                                <Image
                                  // source={require('../assets/images/heavyrain.png')}
                                  source={weatherImages[item?.day?.condition?.text] || weatherImages['other']}
                                  className='h-11 w-11 '
                                />
                                <Text className='text-white'>
                                  {dayName}
                                </Text>
                                <Text className='text-white'>
                                  {item.date}
                                </Text>
                                <Text className='text-white text-xl font-semibold'>
                                  {item?.day?.avgtemp_c}&#176;
                                </Text>
                              </View>
                            )
                          })

                        }

                      </ScrollView>

                    </View>
                  </>
                ) : (
                  // Show a loading indicator/welcome message
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-white text-2xl">Search for a city to see the weather</Text>
                  </View>
                )
              }


            </>

          )
        }







      </SafeAreaView >


    </View >

  );
}

