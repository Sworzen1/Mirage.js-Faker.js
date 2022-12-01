import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { Mirage } from './mirage/MirageServer';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetch('api/tasks')
        .then((res) => res.json())
        .then((json) => setTasks(json.tasks));
      await fetch('api/users')
        .then((res) => res.json())
        .then((json) => setUsers(json.users));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserTasks = useCallback(async () => {
    await fetch(`api/tasks/${users[1].id}`)
      .then((res) => res.json())
      .then((json) => console.log(json));
  }, [users, tasks]);

  useEffect(() => {
    if (users.length > 1) fetchUserTasks();
  }, [users]);

  useEffect(() => {
    Mirage.createMirageServer();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const onUpdateTask = useCallback(async (taskId: string) => {
    await fetch(`api/tasks/update/${taskId}`, {
      method: 'POST',
      body: { title: 'updated' },
    });
    await fetchData();
  }, []);

  const onAddTask = useCallback(async () => {
    await fetch('api/tasks/create', {
      method: 'POST',
      body: { title: taskText, user: selectedUser },
    });
    await fetchData();
  }, [taskText, selectedUser]);

  const onDeleteTask = useCallback(async (id: string) => {
    await fetch(`api/tasks/delete/${id}`, {
      method: 'DELETE',
    });
    await fetchData();
  }, []);

  return isLoading ? (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} />
    </View>
  ) : (
    <SafeAreaView>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <TextInput
            value={taskText}
            onChangeText={setTaskText}
            style={styles.input}
          />
          <Picker
            selectedValue={selectedUser}
            onValueChange={setSelectedUser}
            style={styles.picker}
          >
            {users.map((user) => {
              return (
                <Picker.Item key={user.id} label={user.name} value={user.id} />
              );
            })}
          </Picker>
          <Button title="Add" onPress={onAddTask}></Button>
          <Button title="Refresh" onPress={fetchData}></Button>
          <Text>Users:</Text>
          {users.map((user) => {
            return (
              <View style={styles.row} key={user.id}>
                <Text>{user.name}</Text>
                <Text>{user.surname}</Text>
                <Text>{user.age}</Text>
                <Text>{user.sex}</Text>
              </View>
            );
          })}
          <Text style={{ marginTop: 24 }}>Tasks:</Text>
          {tasks.map((task) => {
            return (
              <Pressable
                style={styles.row}
                key={task.id}
                onPress={() => onUpdateTask(task.id)}
              >
                <Text>{task.title}</Text>
                <Text>{task.startAt}</Text>
                <Pressable
                  onPress={() => onDeleteTask(task.id)}
                  style={styles.deleteButton}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '90%',
    height: 58,
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  deleteButton: {
    width: 30,
    height: 30,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  picker: { borderWidth: 1, width: '90%', height: 'auto' },
  scrollContainer: { flexGrow: 1 },
});
