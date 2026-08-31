import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function ExpenseDetailScreen({ navigation, route }) {
  const expense = route.params?.expense;

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text>Expense not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
        Expense Details
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>Title</Text>
        <Text style={styles.value}>
          {expense.title}
        </Text>

        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>
          {expense.currency} {expense.amount}
        </Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>
          {expense.category_name || 'No Category'}
        </Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>
          {expense.expense_date}
        </Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>
          {expense.status}
        </Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>
          {expense.description || 'No description'}
        </Text>

        {expense.ocr_text && (
          <>
            <Text style={styles.label}>
              OCR Result
            </Text>

            <Text style={styles.value}>
              {expense.ocr_text}
            </Text>
          </>
        )}

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>
          Back
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 25,
  },

  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 20,
  },

  label: {
    fontSize: 13,
    color: '#777',
    marginTop: 12,
  },

  value: {
    fontSize: 17,
    marginTop: 4,
  },

  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },

  button: {
    backgroundColor: '#000',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});