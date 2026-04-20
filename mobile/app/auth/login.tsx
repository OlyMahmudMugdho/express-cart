import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const ok = await signIn(email, password);
    setLoading(false);
    if (ok) router.push('/');
  }

  return (
    <View style={{ padding: 16 }}>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ marginTop: 8 }} />
      <Button mode="contained" onPress={handleLogin} loading={loading} style={{ marginTop: 16 }}>
        Login
      </Button>
      <Text style={{ marginTop: 8 }} onPress={() => router.push('/auth/register')}>Don't have an account? Register</Text>
    </View>
  );
}
