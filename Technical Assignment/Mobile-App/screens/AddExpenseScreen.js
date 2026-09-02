
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

  const accessToken = route.params?.accessToken;

  // Check whether we are editing
  const expense = route.params?.expense;
  const isEditing = route.params?.isEditing === true;

  const [title, setTitle] = useState(
    expense?.title || ''
  );

  const [amount, setAmount] = useState(
    expense?.amount ? String(expense.amount) : ''
  );

  const [currency, setCurrency] = useState(
    expense?.currency || 'PKR'
  );

  const [description, setDescription] = useState(
    expense?.description || ''
  );

  const [receipt, setReceipt] = useState(null);

  const [expenseDate, setExpenseDate] = useState(
    expense?.expense_date
      ? new Date(`${expense.expense_date}T00:00:00`)
      : new Date()
  );

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState(
      expense?.category
        ? {
            id: expense.category,
            name: expense.category_name,
          }
        : null
    );

  const [showCategories, setShowCategories] =
    useState(false);

  const [categoriesLoading, setCategoriesLoading] =
    useState(false);

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
      return;
    }

    try {

      setCategoriesLoading(true);

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

      if (response.ok) {

        const categoryData =
          Array.isArray(data)
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
              onPress: () =>
                navigation.replace('Login'),
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
  // SAVE EXPENSE
  // -----------------------------------

  const saveExpense = async () => {

    if (!accessToken) {

      Alert.alert(
        'Authentication Error',
        'Please login again.'
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

      if (selectedCategory) {

        formData.append(
          'category',
          String(selectedCategory.id)
        );
      }

      // Only attach a new receipt if user selected one
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

      const url = isEditing
        ? `${API_URL}/api/v1/expenses/${expense.id}/`
        : `${API_URL}/api/v1/expenses/`;

      const method = isEditing
        ? 'PATCH'
        : 'POST';

      console.log(
        isEditing
          ? 'Updating expense...'
          : 'Creating expense...'
      );

      const response = await fetch(
        url,
        {
          method,

          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },

          body: formData,
        }
      );

      const data =
        await response.json();

      console.log(
        'Save expense response:',
        response.status,
        data
      );

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

      Alert.alert(
        'Success',
        isEditing
          ? 'Expense updated successfully!'
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
        'Save expense error:',
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
        {isEditing
          ? 'Edit Expense'
          : 'Add Expense'}
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
            ? 'New Receipt Selected ✓'
            : expense?.receipt
            ? 'Replace Receipt'
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

      {/* SAVE */}

      <TouchableOpacity
        style={styles.button}
        onPress={saveExpense}
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
            {isEditing
              ? 'Update Expense'
              : 'Create Expense'}
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

