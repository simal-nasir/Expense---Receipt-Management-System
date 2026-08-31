import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

const API_URL = 'http://127.0.0.1:8000';

export default function AddExpenseScreen({ navigation, route }) {

  // Get JWT token from LoginScreen
  const accessToken = route.params?.accessToken;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [description, setDescription] = useState('');

  // Receipt
  const [receipt, setReceipt] = useState(null);

  // Date - today's date by default
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [loading, setLoading] = useState(false);


  // -----------------------------------
  // FORMAT DATE
  // -----------------------------------

  const formatDate = (date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };


  // -----------------------------------
  // LOAD CATEGORIES
  // -----------------------------------

  const fetchCategories = async () => {

    if (!accessToken) {
      console.log('No access token available');
      return;
    }

    try {

      setCategoriesLoading(true);

      console.log(
        'Loading categories with token:',
        accessToken ? 'TOKEN EXISTS' : 'NO TOKEN'
      );

      const response = await fetch(
        `${API_URL}/api/v1/expenses/categories/`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      const data = await response.json();

      console.log(
        'Categories response:',
        response.status,
        data
      );

      if (response.ok) {

        const categoryData = Array.isArray(data)
          ? data
          : data.results || [];

        setCategories(categoryData);

      } else if (response.status === 401) {

        Alert.alert(
          'Session Expired',
          'Please login again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]
        );

      } else {

        Alert.alert(
          'Error',
          'Could not load categories.'
        );
      }

    } catch (error) {

      console.log(
        'Category error:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Could not load categories.'
      );

    } finally {

      setCategoriesLoading(false);

    }
  };


  // Load categories when screen opens
  useEffect(() => {

    fetchCategories();

  }, [accessToken]);


  // -----------------------------------
  // DATE PICKER
  // -----------------------------------

  const handleDateChange = (
    event,
    selectedDate
  ) => {

    setShowDatePicker(false);

    if (selectedDate) {
      setExpenseDate(selectedDate);
    }
  };


  // -----------------------------------
  // PICK RECEIPT
  // -----------------------------------

  const pickReceipt = async () => {

    try {

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {

        Alert.alert(
          'Permission Required',
          'Please allow access to your photos.'
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes: ['images'],

          allowsEditing: true,

          quality: 0.8,

        });

      if (!result.canceled) {

        const selectedReceipt =
          result.assets[0];

        console.log(
          'Selected receipt:',
          selectedReceipt
        );

        setReceipt(selectedReceipt);
      }

    } catch (error) {

      console.log(
        'Receipt picker error:',
        error
      );

      Alert.alert(
        'Error',
        'Could not select receipt.'
      );
    }
  };


  // -----------------------------------
  // CREATE EXPENSE
  // -----------------------------------

  const createExpense = async () => {

    if (!accessToken) {

      Alert.alert(
        'Authentication Error',
        'You are not logged in. Please login again.'
      );

      return;
    }

    if (!title.trim() || !amount.trim()) {

      Alert.alert(
        'Missing Information',
        'Please enter title and amount.'
      );

      return;
    }


    try {

      setLoading(true);


      // -----------------------------------
      // CREATE MULTIPART FORM
      // -----------------------------------

      const formData = new FormData();

      formData.append(
        'title',
        title
      );

      formData.append(
        'amount',
        amount
      );

      formData.append(
        'currency',
        currency
      );

      formData.append(
        'description',
        description
      );

      formData.append(
        'expense_date',
        formatDate(expenseDate)
      );


      // Category
      if (selectedCategory) {

        formData.append(
          'category',
          String(selectedCategory.id)
        );
      }


      // Receipt
      if (receipt) {

        formData.append(
          'receipt',
          {
            uri: receipt.uri,

            name:
              receipt.fileName ||
              'receipt.jpg',

            type:
              receipt.mimeType ||
              'image/jpeg',
          }
        );
      }


      console.log(
        'Creating expense...'
      );


      // -----------------------------------
      // SEND TO DJANGO
      // -----------------------------------

      const response = await fetch(
        `${API_URL}/api/v1/expenses/`,
        {
          method: 'POST',

          headers: {

            Authorization:
              `Bearer ${accessToken}`,

            // DO NOT set Content-Type here.
            // FormData sets it automatically.
          },

          body: formData,
        }
      );


      const data =
        await response.json();


      console.log(
        'Create expense response:',
        response.status,
        data
      );


      // -----------------------------------
      // HANDLE ERRORS
      // -----------------------------------

      if (!response.ok) {

        if (response.status === 401) {

          Alert.alert(
            'Session Expired',
            'Please login again.',
            [
              {
                text: 'OK',
                onPress: () =>
                  navigation.replace('Login'),
              },
            ]
          );

          return;
        }


        Alert.alert(
          'Error',
          JSON.stringify(data)
        );

        return;
      }


      // -----------------------------------
      // SUCCESS
      // -----------------------------------

      Alert.alert(
        'Success',
        receipt
          ? 'Expense and receipt uploaded successfully!'
          : 'Expense created successfully!',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );

    } catch (error) {

      console.log(
        'Create expense error:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Could not connect to backend.'
      );

    } finally {

      setLoading(false);

    }
  };


  // -----------------------------------
  // UI
  // -----------------------------------

  return (

    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >

      <Text style={styles.heading}>
        Add Expense
      </Text>


      {/* TITLE */}

      <TextInput
        style={styles.input}
        placeholder="Expense title"
        value={title}
        onChangeText={setTitle}
      />


      {/* AMOUNT */}

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />


      {/* CURRENCY */}

      <TextInput
        style={styles.input}
        placeholder="Currency"
        value={currency}
        onChangeText={setCurrency}
        autoCapitalize="characters"
      />


      {/* DESCRIPTION */}

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />


      {/* CATEGORY */}

      <TouchableOpacity
        style={styles.input}
        onPress={() =>
          setShowCategories(
            !showCategories
          )
        }
      >

        <Text
          style={
            selectedCategory
              ? styles.selectedText
              : styles.placeholder
          }
        >

          {selectedCategory
            ? selectedCategory.name
            : categoriesLoading
              ? 'Loading categories...'
              : 'Select Category'}

        </Text>

      </TouchableOpacity>


      {/* CATEGORY OPTIONS */}

      {showCategories && (

        <View style={styles.categoryList}>

          {categories.length === 0 ? (

            <Text style={styles.noCategories}>
              No categories available
            </Text>

          ) : (

            categories.map(
              (category) => (

                <TouchableOpacity
                  key={category.id}
                  style={
                    styles.categoryOption
                  }
                  onPress={() => {

                    setSelectedCategory(
                      category
                    );

                    setShowCategories(
                      false
                    );

                  }}
                >

                  <Text
                    style={
                      styles.categoryText
                    }
                  >
                    {category.name}
                  </Text>

                </TouchableOpacity>

              )
            )

          )}

        </View>

      )}


      {/* RECEIPT */}

      <TouchableOpacity
        style={styles.receiptButton}
        onPress={pickReceipt}
      >

        <Text
          style={
            styles.receiptButtonText
          }
        >

          {receipt
            ? 'Receipt Selected ✓'
            : 'Upload Receipt'}

        </Text>

      </TouchableOpacity>


      {/* RECEIPT NAME */}

      {receipt && (

        <Text
          style={styles.receiptName}
        >

          {receipt.fileName ||
            'Receipt image selected'}

        </Text>

      )}


      {/* DATE */}

      <TouchableOpacity
        style={styles.input}
        onPress={() =>
          setShowDatePicker(true)
        }
      >

        <Text
          style={styles.selectedText}
        >

          {formatDate(expenseDate)}

        </Text>

      </TouchableOpacity>


      {/* DATE PICKER */}

      {showDatePicker && (

        <DateTimePicker
          value={expenseDate}
          mode="date"

          display={
            Platform.OS === 'ios'
              ? 'spinner'
              : 'default'
          }

          onChange={
            handleDateChange
          }
        />

      )}


      {/* CREATE BUTTON */}

      <TouchableOpacity
        style={styles.button}
        onPress={createExpense}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator
            color="#fff"
          />

        ) : (

          <Text
            style={styles.buttonText}
          >
            Create Expense
          </Text>

        )}

      </TouchableOpacity>


      {/* CANCEL */}

      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
      >

        <Text
          style={styles.cancel}
        >
          Cancel
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}


// -----------------------------------
// STYLES
// -----------------------------------

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
    justifyContent: 'center',
  },

  placeholder: {
    color: '#888',
  },

  selectedText: {
    color: '#000',
  },

  categoryList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginTop: -10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },

  categoryOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  categoryText: {
    fontSize: 16,
  },

  noCategories: {
    padding: 15,
    color: '#777',
    textAlign: 'center',
  },

  receiptButton: {
    height: 52,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  receiptButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  receiptName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },

  button: {
    height: 52,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancel: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },

});