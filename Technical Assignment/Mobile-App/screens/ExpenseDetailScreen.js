import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

const API_URL = 'http://127.0.0.1:8000';

export default function ExpenseDetailScreen({ navigation, route }) {
  const expense = route.params?.expense;
  const accessToken = route.params?.accessToken;

  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    expense?.status || 'DRAFT'
  );

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text>Expense not found.</Text>
      </View>
    );
  }

  // -----------------------------------
  // SUBMIT EXPENSE
  // -----------------------------------

  const submitExpense = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/v1/expenses/${expense.id}/submit/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      console.log('Submit expense:', data);

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.detail || 'Could not submit expense.'
        );
        return;
      }

      setCurrentStatus('SUBMITTED');

      Alert.alert(
        'Success',
        'Expense submitted for approval.'
      );
    } catch (error) {
      console.log('Submit error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // DELETE EXPENSE
  // -----------------------------------

  const deleteExpense = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const response = await fetch(
                `${API_URL}/api/v1/expenses/${expense.id}/`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (!response.ok) {
                let data = {};

                try {
                  data = await response.json();
                } catch (error) {}

                Alert.alert(
                  'Error',
                  data.detail || 'Could not delete expense.'
                );

                return;
              }

              Alert.alert(
                'Deleted',
                'Expense deleted successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.log('Delete error:', error);

              Alert.alert(
                'Connection Error',
                'Could not connect to backend.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // -----------------------------------
  // EDIT EXPENSE
  // -----------------------------------

  const editExpense = () => {
    navigation.navigate('AddExpense', {
      accessToken,
      expense,
      isEditing: true,
    });
  };

  const canEditOrDelete =
    currentStatus === 'DRAFT' ||
    currentStatus === 'REJECTED';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
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

        <Text
          style={[
            styles.status,
            currentStatus === 'APPROVED'
              ? styles.approved
              : currentStatus === 'REJECTED'
              ? styles.rejected
              : currentStatus === 'SUBMITTED'
              ? styles.submitted
              : styles.draft,
          ]}
        >
          {currentStatus}
        </Text>

        <Text style={styles.label}>Description</Text>

        <Text style={styles.value}>
          {expense.description || 'No description'}
        </Text>

        {expense.rejection_reason && (
          <>
            <Text style={styles.label}>
              Rejection Reason
            </Text>

            <Text style={styles.rejectionReason}>
              {expense.rejection_reason}
            </Text>
          </>
        )}

        {expense.receipt && (
          <>
            <Text style={styles.label}>
              Receipt
            </Text>

            <Text style={styles.receiptText}>
              Receipt uploaded ✓
            </Text>
          </>
        )}

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

        {expense.merchant && (
          <>
            <Text style={styles.label}>
              Merchant
            </Text>

            <Text style={styles.value}>
              {expense.merchant}
            </Text>
          </>
        )}

        {expense.ocr_total && (
          <>
            <Text style={styles.label}>
              OCR Total
            </Text>

            <Text style={styles.value}>
              {expense.ocr_total}
            </Text>
          </>
        )}
      </View>

      {/* EDIT */}

      {canEditOrDelete && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={editExpense}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            Update Expense
          </Text>
        </TouchableOpacity>
      )}

      {/* DELETE */}

      {canEditOrDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={deleteExpense}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Delete Expense
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* SUBMIT */}

      {currentStatus === 'DRAFT' && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitExpense}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Submit for Approval
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* BACK */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>
          Back
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

  draft: {
    color: '#D97706',
  },

  submitted: {
    color: '#2563EB',
  },

  approved: {
    color: 'green',
  },

  rejected: {
    color: 'red',
  },

  rejectionReason: {
    fontSize: 16,
    color: 'red',
    marginTop: 4,
  },

  receiptText: {
    fontSize: 16,
    marginTop: 4,
    color: 'green',
  },

  editButton: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  deleteButton: {
    backgroundColor: '#DC2626',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  submitButton: {
    backgroundColor: '#000',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  buttonText: {
    color: '#fff',
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
    marginBottom: 20,
  },

  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

