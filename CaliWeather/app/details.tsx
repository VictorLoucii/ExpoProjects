import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowUturnLeftIcon } from 'react-native-heroicons/solid'
import { useNavigation } from 'expo-router'
import { Colors } from '@/constants/Colors'


const detailScreen = () => {

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();




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

        {/* Back Button */}
        <View className="px-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-full h-10 w-10 justify-center items-center"
            style={{backgroundColor: Colors.theme.bgWhite(0.1)}}
          >
            <ArrowUturnLeftIcon size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className='justify-center items-center'>
        <Text className='text-white font-bold text-large'>
          Today's Weather Details
        </Text>

        </View>





      </SafeAreaView>


    </View>

  )
}

export default detailScreen

const styles = StyleSheet.create({})