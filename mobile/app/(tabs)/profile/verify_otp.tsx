import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, HelperText, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function VerifyOtp() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const { verifyOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const submitOtp = async () => {
    if (!code || code.length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(code);
    setLoading(false);

    if (result.success) {
      router.back();
    } else {
      setError('Invalid or expired code. Please try again.');
      setCode('');
    }
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(60);
      alert('OTP sent again. Please check your email.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your email
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Verification Code"
            value={code}
            onChangeText={(value) => {
              setCode(value.replace(/[^0-9]/g, '').slice(0, 6));
              setError('');
            }}
            style={styles.input}
            keyboardType="number-pad"
            mode="outlined"
            error={!!error}
            maxLength={6}
          />
          {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}
        </View>

        <Button 
          mode="contained" 
          onPress={submitOtp} 
          loading={loading} 
          style={styles.button} 
          contentStyle={styles.buttonContent}
          disabled={code.length < 6}
        >
          Verify
        </Button>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <Button 
            mode="text" 
            onPress={handleResend} 
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
          </Button>
        </View>
      </View>
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
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  button: {
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#64748b',
  },
});