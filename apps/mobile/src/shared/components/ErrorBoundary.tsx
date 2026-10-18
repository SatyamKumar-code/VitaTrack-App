import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log sanitized error in development or local telemetry
    if (__DEV__) {
      console.warn('[ErrorBoundary] Caught user-facing exception:', error.message);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>☀️</Text>
            </View>

            <Text style={styles.title}>We encountered a temporary bump</Text>
            <Text style={styles.subtitle}>
              Your health records and evaluations remain safe and protected on your device. Let's return you to the dashboard.
            </Text>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Refresh &amp; Continue &rarr;</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.slate.bg
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  icon: {
    fontSize: 28
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.slate.textMain,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    color: Colors.slate.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 320
  },
  actionBtn: {
    backgroundColor: Colors.primary.amber,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0F19'
  }
});
