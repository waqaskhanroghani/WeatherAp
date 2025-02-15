import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useWeather } from '../../context/WeatherContext';

export default function SettingsScreen() {
  const {
    isCelsius,
    isDarkMode,
    toggleTemperatureUnit,
    toggleTheme,
  } = useWeather();

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
      <View style={styles.settingInfo}>
        <View style={styles.settingIconContainer}>
          <FontAwesome 
            name={icon} 
            size={24} 
            color={isDarkMode ? '#fff' : '#000'} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, isDarkMode && styles.darkSubtext]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#2196F3' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.darkContainer]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Display
        </Text>
        {renderSettingItem(
          'moon-o',
          'Dark Mode',
          'Switch between light and dark theme',
          isDarkMode,
          toggleTheme
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          Weather
        </Text>
        {renderSettingItem(
          'sun-o',
          'Temperature Unit',
          'Switch between Celsius and Fahrenheit',
          isCelsius,
          toggleTemperatureUnit
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          About
        </Text>
        <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <FontAwesome 
                name="info-circle" 
                size={24} 
                color={isDarkMode ? '#fff' : '#000'} 
              />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                Version
              </Text>
              <Text style={[styles.settingDescription, isDarkMode && styles.darkSubtext]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  darkSettingItem: {
    backgroundColor: '#333',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#aaa',
  },
});
