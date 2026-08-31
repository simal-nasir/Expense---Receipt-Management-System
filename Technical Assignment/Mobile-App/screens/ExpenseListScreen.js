import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function ExpenseListScreen({ navigation, route }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const accessToken = route.params?.accessToken;

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/expenses/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setExpenses(data.results || data);
      } else {
        Alert.alert('Error', 'Could not load expenses');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Could not connect to server'
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderExpense = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ExpenseDetail', {
          expense: item,
          accessToken,
        })
      }
    >
      <View>
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.category}>
          {item.category_name || 'No Category'}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>
          {item.currency} {item.amount}
        </Text>

        <Text style={styles.status}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Expenses</Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpense}
        refreshing={loading}
        onRefresh={fetchExpenses}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No expenses yet
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddExpense', {
            accessToken,
            refreshExpenses: fetchExpenses,
          })
        }
      >
        <Text style={styles.addButtonText}>+ Add Expense</Text>
      </TouchableOpacity>
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

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 30,
  },

  card: {
    backgroundColor: '#F7F7F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
  },

  category: {
    marginTop: 5,
    color: '#777',
  },

  right: {
    alignItems: 'flex-end',
  },

  amount: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  status: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },

  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
  },

  addButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },

  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});