import { reloadAppAsync } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Start `node server.js` first. The iOS simulator reaches the host at 127.0.0.1.
const SERVER = 'http://127.0.0.1:9876';
const PENDING_REQUESTS = 150;

export default function App() {
  const [status, setStatus] = useState('Starting...');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    fetch(`${SERVER}/iter?t=${Date.now()}`)
      .then((response) => response.text())
      .then((iteration) => {
        setStatus(`JS instance #${iteration}: ${PENDING_REQUESTS} requests waiting for headers`);

        // Requests that never receive response headers.
        for (let i = 0; i < PENDING_REQUESTS; i++) {
          fetch(`${SERVER}/hang/${i}?t=${Date.now()}`).catch(() => {});
        }

        // Then: the server drops those sockets while the React instance reloads.
        timer = setTimeout(() => {
          fetch(`${SERVER}/drop?t=${Date.now()}`).catch(() => {});
          reloadAppAsync('repro');
        }, 400 + Math.random() * 1200);
      })
      .catch((error) => setStatus(`Is server.js running? ${String(error)}`));

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text>{status}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
