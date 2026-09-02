import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

const API_URL = 'http://127.0.0.1:8000';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

 const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert(
      'Error',
      'Please enter email and password.'
    );
    return;
  }

  try {
    setLoading(true);

    // STEP 1: LOGIN AND GET JWT TOKEN
    const response = await fetch(
      `${API_URL}/api/v1/auth/login/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      }
    );

    const data = await response.json();

    console.log('Login response:', data);

    if (!response.ok) {
      Alert.alert(
        'Login Failed',
        data.detail || 'Invalid email or password.'
      );
      return;
    }

    const accessToken = data.access;

    if (!accessToken) {
      Alert.alert(
        'Login Error',
        'Access token was not returned.'
      );
      return;
    }

    // STEP 2: GET CURRENT USER INFORMATION
    const userResponse = await fetch(
      `${API_URL}/api/v1/auth/me/`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = await userResponse.json();

    console.log('Current user:', userData);

    if (!userResponse.ok) {
      Alert.alert(
        'Error',
        'Could not retrieve user information.'
      );
      return;
    }

    // STEP 3: REDIRECT BASED ON ROLE
    if (
      userData.role === 'MANAGER' ||
      userData.role === 'ADMIN'
    ) {
      navigation.replace('ManagerDashboard', {
        accessToken: accessToken,
      });
    } else {
      navigation.replace('Expenses', {
        accessToken: accessToken,
      });
    }

  } catch (error) {
    console.log('Login error:', error);

    Alert.alert(
      'Connection Error',
      'Could not connect to the backend.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Welcome Back
      </Text>

      <Text style={styles.subtitle}>
        Sign in to manage your expenses
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      {/* REGISTER */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 35,
    color: '#666',
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    marginTop: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  registerText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
    fontWeight: '500',
  },
});