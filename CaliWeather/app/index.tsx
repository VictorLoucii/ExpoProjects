// defining FC Home Screen in file index.tsx

import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'


export default function HomeScreen() {

  const insets = useSafeAreaInsets();


  return (
    <View className='flex-1 relative'>
      <StatusBar style="light" />
      {/* Background Image */}
      <Image
        blurRadius={70}
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
          <View className="flex-row justify-end items-center rounded-full"
            style={{ backgroundColor: Colors.theme.bgWhite(0.2) }}
          >
            <TextInput
              placeholder='enter the city name here'
              placeholderTextColor={'lightgray'}
              className='pl-6 h-10 flex-1 text-base text-white'
            />

            <TouchableOpacity
              style={{ backgroundColor: Colors.theme.bgWhite(0.3) }}
              className='rounded-full p-3 m-1'
            >
              <MagnifyingGlassIcon size={25} color={'white'} />


            </TouchableOpacity>

          </View>
        </View>
      </SafeAreaView>


    </View>

  );
}

