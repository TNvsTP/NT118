import { Link, router } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Tên"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/(tabs)/home' as any)}
      >
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
      
      <Link href="/login" style={styles.link}>
        Đã có tài khoản? Đăng nhập
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
  },
});
