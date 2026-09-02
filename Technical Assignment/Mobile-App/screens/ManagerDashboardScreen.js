
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';

const API_URL = 'http://127.0.0.1:8000';

export default function ManagerDashboardScreen({ route, navigation }) {
  const accessToken = route.params?.accessToken;

  const [dashboard, setDashboard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rejection Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/expenses/dashboard/manager/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      console.log('Manager dashboard:', data);

      if (response.ok) {
        setDashboard(data);
      } else {
        Alert.alert(
          'Error',
          data.detail || 'Could not load dashboard.'
        );
      }
    } catch (error) {
      console.log('Dashboard error:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to backend.'
      );
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/expenses/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      console.log('Manager expenses:', data);

      if (response.ok) {
        setExpenses(
          Array.isArray(data) ? data : data.results || []
        );
      } else {
        Alert.alert(
          'Error',
          data.detail || 'Could not load expenses.'
        );
      }
    } catch (error) {
      console.log('Expenses error:', error);
    }
  };

  const loadData = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchDashboard(),
      fetchExpenses(),
    ]);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveExpense = async (expenseId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/expenses/${expenseId}/approve/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.detail || 'Could not approve expense.'
        );
        return;
      }

      Alert.alert(
        'Success',
        'Expense approved.'
      );

      loadData();

    } catch (error) {
      console.log('Approve error:', error);

      Alert.alert(
        'Error',
        'Could not connect to backend.'
      );
    }
  };

  // Open rejection modal
  const openRejectModal = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setRejectionReason('');
    setModalVisible(true);
  };

  // Close rejection modal
  const closeRejectModal = () => {
    if (!rejecting) {
      setModalVisible(false);
      setSelectedExpenseId(null);
      setRejectionReason('');
    }
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert(
        'Error',
        'Please enter a rejection reason.'
      );
      return;
    }

    try {
      setRejecting(true);

      const response = await fetch(
        `${API_URL}/api/v1/expenses/${selectedExpenseId}/reject/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rejection_reason: rejectionReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.detail || 'Could not reject expense.'
        );
        return;
      }

      setModalVisible(false);
      setSelectedExpenseId(null);
      setRejectionReason('');

      Alert.alert(
        'Success',
        'Expense rejected.'
      );

      loadData();

    } catch (error) {
      console.log('Reject error:', error);

      Alert.alert(
        'Error',
        'Could not connect to backend.'
      );
    } finally {
      setRejecting(false);
    }
  };

  const renderExpense = ({ item }) => {
    const isPending = item.status === 'SUBMITTED';

    return (
      <View style={styles.expenseCard}>

        <View style={styles.expenseTop}>

          <View style={{ flex: 1 }}>

            <Text style={styles.expenseTitle}>
              {item.title}
            </Text>

            <Text style={styles.employee}>
              Employee ID: {item.user}
            </Text>

            <Text style={styles.category}>
              {item.category_name || 'No Category'}
            </Text>

            <Text style={styles.date}>
              {item.expense_date}
            </Text>

          </View>

          <View style={styles.amountContainer}>

            <Text style={styles.amount}>
              {item.currency} {item.amount}
            </Text>

            <Text
              style={[
                styles.status,
                item.status === 'APPROVED'
                  ? styles.approved
                  : item.status === 'REJECTED'
                  ? styles.rejected
                  : styles.pending,
              ]}
            >
              {item.status}
            </Text>

          </View>

        </View>

        {item.description ? (
          <Text style={styles.description}>
            {item.description}
          </Text>
        ) : null}

        {item.rejection_reason ? (
          <Text style={styles.rejectionReason}>
            Reason: {item.rejection_reason}
          </Text>
        ) : null}

        {isPending && (
          <View style={styles.actions}>

            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => approveExpense(item.id)}
            >
              <Text style={styles.actionText}>
                Approve
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => openRejectModal(item.id)}
            >
              <Text style={styles.actionText}>
                Reject
              </Text>
            </TouchableOpacity>

          </View>
        )}

      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>
          Manager Dashboard
        </Text>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() =>
            navigation.navigate('Profile', {
              accessToken,
            })
          }
        >
          <Text style={styles.profileButtonText}>
            👤 Profile
          </Text>
        </TouchableOpacity>
      </View>

      {dashboard && (
        <View style={styles.statsContainer}>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.total_employees}
            </Text>
            <Text style={styles.statLabel}>
              Employees
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.total_expenses}
            </Text>
            <Text style={styles.statLabel}>
              Expenses
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.pending_approvals}
            </Text>
            <Text style={styles.statLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.approved_expenses}
            </Text>
            <Text style={styles.statLabel}>
              Approved
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboard.rejected_expenses}
            </Text>
            <Text style={styles.statLabel}>
              Rejected
            </Text>
          </View>

        </View>
      )}

      <Text style={styles.sectionTitle}>
        Employee Expenses
      </Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpense}
        refreshing={refreshing}
        onRefresh={loadData}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No expenses found.
          </Text>
        }
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      />

      {/* REJECTION MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeRejectModal}
      >
        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>
              Reject Expense
            </Text>

            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting this expense.
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              editable={!rejecting}
            />

            <View style={styles.modalButtons}>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeRejectModal}
                disabled={rejecting}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRejectButton}
                onPress={submitRejection}
                disabled={rejecting}
              >
                {rejecting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmRejectText}>
                    Reject
                  </Text>
                )}
              </TouchableOpacity>

            </View>

          </View>

        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },

  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    flex: 1,
  },

  profileButton: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 10,
  },

  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },

  statCard: {
    width: '30%',
    minHeight: 85,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  expenseCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  expenseTop: {
    flexDirection: 'row',
  },

  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  employee: {
    marginTop: 5,
    fontSize: 13,
    color: '#555',
  },

  category: {
    marginTop: 4,
    fontSize: 13,
    color: '#777',
  },

  date: {
    marginTop: 4,
    fontSize: 13,
    color: '#777',
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  status: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: 'bold',
  },

  approved: {
    color: 'green',
  },

  rejected: {
    color: 'red',
  },

  pending: {
    color: '#D97706',
  },

  description: {
    marginTop: 12,
    color: '#555',
  },

  rejectionReason: {
    marginTop: 10,
    color: 'red',
    fontSize: 13,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },

  approveButton: {
    flex: 1,
    backgroundColor: '#000',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  rejectButton: {
    flex: 1,
    backgroundColor: '#555',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 25,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
    lineHeight: 20,
  },

  reasonInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelButtonText: {
    fontWeight: '600',
    color: '#333',
  },

  confirmRejectButton: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  confirmRejectText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
