import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useApi } from '../utils/api';
import { useRouter } from 'expo-router';

export default function Register() {
  const api = useApi();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    try {
      await api.register({ email, password, firstName: '', lastName: '' });
      router.push('/auth/login');
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ marginTop: 8 }} />
      <Button mode="contained" onPress={handleRegister} loading={loading} style={{ marginTop: 16 }}>
        Register
      </Button>
    </View>
  );
}
