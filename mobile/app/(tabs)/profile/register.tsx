import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link, useLocalSearchParams } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const { signUp } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await signUp(email, password, firstName, lastName);
    setLoading(false);
    
    if (result.success && result.needsVerification) {
      router.replace({ pathname: '/profile/verify_otp', params: { userId: result.userId, type: 'verification' } });
    } else if (result.success) {
      router.replace('/profile/login');
    } else {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start shopping</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            mode="outlined"
            outlineColor="#cbd5e1"
            activeOutlineColor="#0f172a"
            textColor="#0f172a"
            error={!!errors.firstName}
          />
          {errors.firstName && <HelperText type="error">{errors.firstName}</HelperText>}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            outlineColor="#cbd5e1"
            activeOutlineColor="#0f172a"
            textColor="#0f172a"
            error={!!errors.email}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
            mode="outlined"
            outlineColor="#cbd5e1"
            activeOutlineColor="#0f172a"
            textColor="#0f172a"
            right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
            error={!!errors.password}
          />
          {errors.password && <HelperText type="error">{errors.password}</HelperText>}

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry={!showPassword}
            mode="outlined"
            outlineColor="#cbd5e1"
            activeOutlineColor="#0f172a"
            textColor="#0f172a"
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}

          <Button mode="contained" onPress={onSubmit} loading={loading} style={styles.button} contentStyle={styles.buttonContent} textColor="#fff">
            Create Account
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/profile/login" asChild>
            <Button mode="text" textColor="#0f172a">Sign In</Button>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
  },
});