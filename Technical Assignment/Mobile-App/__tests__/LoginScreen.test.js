import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import LoginScreen from '../screens/LoginScreen';

describe('LoginScreen', () => {
  test('shows an error when email and password are empty', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const navigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
    };

    const result = render(<LoginScreen navigation={navigation} />);
    console.log('RESULT KEYS:', Object.keys(result));

    fireEvent.press(result.getByText('Login'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Please enter email and password.'
      );
    });

    alertSpy.mockRestore();
  });
});