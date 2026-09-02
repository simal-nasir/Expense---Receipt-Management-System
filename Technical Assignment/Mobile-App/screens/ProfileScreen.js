import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

const API_URL = 'http://127.0.0.1:8000';

export default function ProfileScreen({ navigation, route }) {
  const accessToken = route.params?.accessToken;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // FETCH USER PROFILE
  // -----------------------------
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/v1/auth/me/`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      console.log('Profile:', data);

      if (response.ok) {
        setUser(data);
      } else {
        Alert.alert(
          'Error',
          data.detail || 'Could not load profile.'
        );
      }
    } catch (error) {
      console.log('Profile error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Login',
                },
              ],
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
        Profile
      </Text>

      <View style={styles.profileCard}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username
              ? user.username.charAt(0).toUpperCase()
              : 'U'}
          </Text>
        </View>

        <Text style={styles.username}>
          {user?.username || 'User'}
        </Text>

        <Text style={styles.role}>
          {user?.role || 'EMPLOYEE'}
        </Text>

      </View>

      <View style={styles.infoCard}>

        <Text style={styles.label}>
          Email
        </Text>

        <Text style={styles.value}>
          {user?.email || 'Not available'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>
          Role
        </Text>

        <Text style={styles.value}>
          {user?.role || 'EMPLOYEE'}
        </Text>

      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>
          Back
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#666',
  },

  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 35,
    marginBottom: 25,
  },

  profileCard: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
  },

  username: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  role: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },

  infoCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },

  label: {
    fontSize: 13,
    color: '#777',
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 18,
  },

  logoutButton: {
    height: 52,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  backButton: {
    height: 52,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
  },

});