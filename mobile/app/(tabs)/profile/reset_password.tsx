import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ code?: string; password?: string; confirmPassword?: string }>({});
  const { forgotPassword, resetPassword } = useAuth();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    
    if (result.success) {
      setStep('otp');
    } else {
      alert('If that email exists, an OTP will be sent.');
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!code) newErrors.code = 'Code is required';
    if (!newPassword) newErrors.password = 'Password is required';
    else if (newPassword.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await resetPassword(code, newPassword);
    setLoading(false);
    
    if (result.success) {
      alert('Password reset successfully! Please sign in.');
      router.replace('/profile/login');
    } else {
      alert('Reset failed. Please try again.');
    }
  };

  if (step === 'otp') {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter the code sent to your email and your new password</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              style={styles.input}
              keyboardType="number-pad"
              mode="outlined"
              error={!!errors.code}
              maxLength={6}
            />
            {errors.code && <HelperText type="error">{errors.code}</HelperText>}

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              secureTextEntry
              mode="outlined"
              error={!!errors.password}
            />
            {errors.password && <HelperText type="error">{errors.password}</HelperText>}

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
              mode="outlined"
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}

            <Button mode="contained" onPress={handleReset} loading={loading} style={styles.button} contentStyle={styles.buttonContent}>
              Reset Password
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a verification code</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
          />

          <Button mode="contained" onPress={handleSendOtp} loading={loading} style={styles.button} contentStyle={styles.buttonContent}>
            Send Code
          </Button>
        </View>

        <View style={styles.footer}>
          <Button mode="text" onPress={() => router.back()}>Back to Login</Button>
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
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});