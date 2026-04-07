import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Modal } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import BalancesScreen from '../screens/BalancesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TopBar from '../components/TopBar';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.498 17.4972V10.8316C12.498 10.6106 12.4102 10.3987 12.2539 10.2425C12.0977 10.0862 11.8857 9.99841 11.6648 9.99841H8.33198C8.111 9.99841 7.89907 10.0862 7.74282 10.2425C7.58656 10.3987 7.49878 10.6106 7.49878 10.8316V17.4972"
        stroke={color}
        strokeWidth={1.66639}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.49963 8.33198C2.49958 8.08958 2.5524 7.85008 2.65443 7.6302C2.75646 7.41031 2.90523 7.21533 3.09037 7.05886L8.92274 2.05968C9.22351 1.80548 9.60459 1.66602 9.9984 1.66602C10.3922 1.66602 10.7733 1.80548 11.0741 2.05968L16.9064 7.05886C17.0916 7.21533 17.2403 7.41031 17.3424 7.6302C17.4444 7.85008 17.4972 8.08958 17.4972 8.33198V15.8307C17.4972 16.2727 17.3216 16.6966 17.0091 17.0091C16.6966 17.3216 16.2727 17.4971 15.8308 17.4971H4.16603C3.72407 17.4971 3.30022 17.3216 2.98771 17.0091C2.6752 16.6966 2.49963 16.2727 2.49963 15.8307V8.33198Z"
        stroke={color}
        strokeWidth={1.66639}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BalancesIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M15.8308 5.83242V3.33283C15.8308 3.11185 15.743 2.89993 15.5867 2.74367C15.4305 2.58742 15.2186 2.49963 14.9976 2.49963H4.16603C3.72407 2.49963 3.30022 2.6752 2.98771 2.98771C2.6752 3.30022 2.49963 3.72407 2.49963 4.16603C2.49963 4.60798 2.6752 5.03183 2.98771 5.34434C3.30022 5.65685 3.72407 5.83242 4.16603 5.83242H16.664C16.8849 5.83242 17.0969 5.9202 17.2531 6.07646C17.4094 6.23271 17.4972 6.44464 17.4972 6.66562V9.9984H14.9976C14.5556 9.9984 14.1318 10.174 13.8193 10.4865C13.5068 10.799 13.3312 11.2228 13.3312 11.6648C13.3312 12.1067 13.5068 12.5306 13.8193 12.8431C14.1318 13.1556 14.5556 13.3312 14.9976 13.3312H17.4972C17.7181 13.3312 17.9301 13.2434 18.0863 13.0871C18.2426 12.9309 18.3304 12.719 18.3304 12.498V10.8316C18.3304 10.6106 18.2426 10.3987 18.0863 10.2424C17.9301 10.0862 17.7181 9.9984 17.4972 9.9984"
        fill={color}
      />
      <Path
        d="M15.8308 5.83242V3.33283C15.8308 3.11185 15.743 2.89993 15.5867 2.74367C15.4305 2.58742 15.2186 2.49963 14.9976 2.49963H4.16603C3.72407 2.49963 3.30022 2.6752 2.98771 2.98771C2.6752 3.30022 2.49963 3.72407 2.49963 4.16603C2.49963 4.60798 2.6752 5.03183 2.98771 5.34434C3.30022 5.65685 3.72407 5.83242 4.16603 5.83242H16.664C16.8849 5.83242 17.0969 5.9202 17.2531 6.07646C17.4094 6.23271 17.4972 6.44464 17.4972 6.66561V9.9984M17.4972 9.9984H14.9976C14.5556 9.9984 14.1318 10.174 13.8193 10.4865C13.5068 10.799 13.3312 11.2228 13.3312 11.6648C13.3312 12.1067 13.5068 12.5306 13.8193 12.8431C14.1318 13.1556 14.5556 13.3312 14.9976 13.3312H17.4972C17.7181 13.3312 17.9301 13.2434 18.0863 13.0871C18.2426 12.9309 18.3304 12.719 18.3304 12.498V10.8316C18.3304 10.6106 18.2426 10.3987 18.0863 10.2424C17.9301 10.0862 17.7181 9.9984 17.4972 9.9984Z"
        stroke={color}
        strokeWidth={1.66639}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.49963 4.16602V15.8308C2.49963 16.2727 2.6752 16.6966 2.98771 17.0091C3.30022 17.3216 3.72407 17.4972 4.16603 17.4972H16.664C16.8849 17.4972 17.0969 17.4094 17.2531 17.2531C17.4094 17.0969 17.4972 16.8849 17.4972 16.664V13.3312"
        fill={color}
      />
      <Path
        d="M2.49963 4.16602V15.8308C2.49963 16.2727 2.6752 16.6966 2.98771 17.0091C3.30022 17.3216 3.72407 17.4972 4.16603 17.4972H16.664C16.8849 17.4972 17.0969 17.4094 17.2531 17.2531C17.4094 17.0969 17.4972 16.8849 17.4972 16.664V13.3312"
        stroke={color}
        strokeWidth={1.66639}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M15.8308 17.4971V15.8307C15.8308 14.9468 15.4796 14.0991 14.8546 13.4741C14.2296 12.8491 13.3819 12.4979 12.498 12.4979H7.4988C6.61489 12.4979 5.76718 12.8491 5.14217 13.4741C4.51715 14.0991 4.16602 14.9468 4.16602 15.8307V17.4971"
        stroke={color}
        strokeWidth={1.66639}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.99831 9.1652C11.839 9.1652 13.3311 7.67306 13.3311 5.83242C13.3311 3.99177 11.839 2.49963 9.99831 2.49963C8.15767 2.49963 6.66553 3.99177 6.66553 5.83242C6.66553 7.67306 8.15767 9.1652 9.99831 9.1652Z"
        fill={color}
        stroke={color}
        strokeWidth={1.66639}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { colors } = useTheme();
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TopBar />
      <View style={{ flex: 1 }}>
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 84 : 60,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Balances"
        component={BalancesScreen}
        options={{
          tabBarIcon: ({ color }) => <BalancesIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tab.Navigator>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.text }]}
        onPress={() => setShowAddTransaction(true)}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus" color={colors.background} size={28} />
      </TouchableOpacity>
      </View>

      <Modal
        visible={showAddTransaction}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <AddTransactionScreen onClose={() => setShowAddTransaction(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 76,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
});
