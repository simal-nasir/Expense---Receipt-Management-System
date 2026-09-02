
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

export default function ExpenseListScreen({ navigation, route }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

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

      console.log('Expenses:', data);

      if (response.ok) {
        setExpenses(data.results || data);
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
          data.detail || 'Could not load expenses'
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Could not connect to server'
      );

      console.log('Expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh expenses whenever this screen becomes active
  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [accessToken])
  );

  // Search + filter expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Filter by status
    if (selectedStatus !== 'ALL') {
      result = result.filter(
        (expense) => expense.status === selectedStatus
      );
    }

    // Search by title, description or category
    const search = searchText.trim().toLowerCase();

    if (search) {
      result = result.filter((expense) => {
        const title = expense.title
          ? expense.title.toLowerCase()
          : '';

        const description = expense.description
          ? expense.description.toLowerCase()
          : '';

        const category = expense.category_name
          ? expense.category_name.toLowerCase()
          : '';

        return (
          title.includes(search) ||
          description.includes(search) ||
          category.includes(search)
        );
      });
    }

    return result;
  }, [expenses, searchText, selectedStatus]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading expenses...
        </Text>
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
      <View style={styles.expenseInfo}>
        <Text style={styles.title}>
          {item.title}
        </Text>

        <Text style={styles.category}>
          {item.category_name || 'No Category'}
        </Text>

        {item.description ? (
          <Text
            style={styles.description}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
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
              : item.status === 'SUBMITTED'
              ? styles.submitted
              : styles.draft,
          ]}
        >
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Text style={styles.heading}>
          My Expenses
        </Text>

        {/* PROFILE BUTTON */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() =>
            navigation.navigate('Profile', {
              accessToken,
            })
          }
        >
          <Text style={styles.profileIcon}>
            👤
          </Text>
          <Text style={styles.profileText}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>

      {/* SEARCH */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search expenses..."
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      {/* FILTERS */}
      <Text style={styles.filterLabel}>
        Filter by status
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >

        {/* ALL */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'ALL' &&
              styles.activeFilter,
          ]}
          onPress={() => setSelectedStatus('ALL')}
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === 'ALL' &&
                styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* DRAFT */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'DRAFT' &&
              styles.activeFilter,
          ]}
          onPress={() => setSelectedStatus('DRAFT')}
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === 'DRAFT' &&
                styles.activeFilterText,
            ]}
          >
            Draft
          </Text>
        </TouchableOpacity>

        {/* SUBMITTED */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'SUBMITTED' &&
              styles.activeFilter,
          ]}
          onPress={() =>
            setSelectedStatus('SUBMITTED')
          }
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === 'SUBMITTED' &&
                styles.activeFilterText,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>

        {/* APPROVED */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'APPROVED' &&
              styles.activeFilter,
          ]}
          onPress={() =>
            setSelectedStatus('APPROVED')
          }
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === 'APPROVED' &&
                styles.activeFilterText,
            ]}
          >
            Approved
          </Text>
        </TouchableOpacity>

        {/* REJECTED */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'REJECTED' &&
              styles.activeFilter,
          ]}
          onPress={() =>
            setSelectedStatus('REJECTED')
          }
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === 'REJECTED' &&
                styles.activeFilterText,
            ]}
          >
            Rejected
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* RESULT COUNT */}
      <Text style={styles.resultCount}>
        {filteredExpenses.length}{' '}
        {filteredExpenses.length === 1
          ? 'expense'
          : 'expenses'}
      </Text>

      {/* EXPENSE LIST */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderExpense}
        refreshing={loading}
        onRefresh={fetchExpenses}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searchText || selectedStatus !== 'ALL'
              ? 'No matching expenses found.'
              : 'No expenses yet'}
          </Text>
        }
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      />

      {/* ADD EXPENSE */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddExpense', {
            accessToken,
          })
        }
      >
        <Text style={styles.addButtonText}>
          + Add Expense
        </Text>
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

  loadingText: {
    marginTop: 10,
    color: '#666',
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  profileButton: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 18,
  },

  profileText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },

  filterScroll: {
    marginBottom: 10,
  },

  filterContainer: {
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
  },

  activeFilter: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },

  filterText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  resultCount: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
    marginTop: 5,
  },

  card: {
    backgroundColor: '#F7F7F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  expenseInfo: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
  },

  category: {
    marginTop: 5,
    color: '#777',
  },

  description: {
    marginTop: 5,
    color: '#888',
    fontSize: 13,
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
    fontWeight: '600',
  },

  approved: {
    color: 'green',
  },

  rejected: {
    color: 'red',
  },

  submitted: {
    color: '#D97706',
  },

  draft: {
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

