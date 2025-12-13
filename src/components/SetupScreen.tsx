import React, { useEffect, useState, useRef } from 'react';
import { Card, Form, Input, Checkbox, Button, Space, Typography, Divider, Alert } from 'antd';
import { ApiOutlined, KeyOutlined } from '@ant-design/icons';
import { useConfig } from '../context/ConfigContext';

const { Title, Text } = Typography;

declare global {
  interface Window {
    google?: any;
  }
}

function decodeJwtExp(idToken: string): number {
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) return 0;
    // base64url -> base64 with padding
    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === 'number' ? payload.exp : 0; // seconds since epoch
  } catch {
    return 0;
  }
}

export const SetupScreen: React.FC = () => {
  const {
    endpoint,
    apiToken,
    saveToLocalStorage,
    sessionNotice,
    clearSessionNotice,
    setConfig,
    setGoogleAuth,
  } = useConfig();
  const buildTimeEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT as string | undefined;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [gsiError, setGsiError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load Google Identity Services script once
    if (window.google && window.google.accounts && window.google.accounts.id) {
      setGsiLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    script.onerror = () => setGsiError('Failed to load Google Sign-In. Check your network and try again.');
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!gsiLoaded || !window.google?.accounts?.id || !googleButtonRef.current) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      setGsiError('Google Client ID is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment and rebuild.');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          const idToken: string = response?.credential;
          const exp = idToken ? decodeJwtExp(idToken) : 0;
          if (!idToken || !exp) {
            setGsiError('Failed to retrieve a valid ID token from Google.');
            return;
          }
          const values = form.getFieldsValue();
          const currentEndpoint = buildTimeEndpoint || values.endpoint;
          if (!currentEndpoint) {
            setGsiError('Please enter the GraphQL endpoint URL before signing in with Google.');
            return;
          }
          setGoogleAuth(currentEndpoint, idToken, exp, !!values.saveToLocalStorage);
        },
        ux_mode: 'popup',
      });

      // Clear previous button (if any) and render Google button
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        width: 400,
      });

    } catch (e) {
      console.error('Failed to initialize Google Sign-In:', e);
      setGsiError('Failed to initialize Google Sign-In. Please refresh and try again.');
    }
  }, [gsiLoaded]);

  const handleConnect = async (values: any) => {
    setLoading(true);
    try {
      // You could add a test query here to validate the connection
      const effectiveEndpoint = buildTimeEndpoint || values.endpoint;
      setConfig(effectiveEndpoint, values.apiToken, values.saveToLocalStorage);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Card style={{ width: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Email Heartbeats</Title>
            <Text type="secondary">Configure your GraphQL connection</Text>
          </div>

          {sessionNotice && (
            <Alert
              type="warning"
              message={sessionNotice}
              showIcon
              closable
              onClose={clearSessionNotice}
            />
          )}

          {gsiError && (
            <Alert
              type="error"
              message={gsiError}
              showIcon
              closable
              onClose={() => setGsiError(null)}
            />
          )}
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleConnect}
            initialValues={{
              endpoint: buildTimeEndpoint || endpoint || '',
              apiToken: apiToken || '',
              saveToLocalStorage: saveToLocalStorage,
            }}
          >
            <Form.Item
              label="GraphQL Endpoint"
              name="endpoint"
              rules={[
                { required: !buildTimeEndpoint, message: 'Please enter the GraphQL endpoint URL' },
                { type: 'url', message: 'Please enter a valid URL' }
              ]}
            >
              <Input
                prefix={<ApiOutlined />}
                placeholder="https://api.example.com/graphql"
                size="large"
                disabled={!!buildTimeEndpoint}
              />
            </Form.Item>

            <Form.Item>
              <div ref={googleButtonRef} style={{ display: 'flex', justifyContent: 'center' }} />
              {!gsiLoaded && <Text type="secondary">Loading Google Sign-In…</Text>}
            </Form.Item>

            <Divider plain>Or</Divider>

            <Form.Item
              label="API Token"
              name="apiToken"
              rules={[{ required: true, message: 'Please enter your API token' }]}
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder="Enter your API token"
                size="large"
              />
            </Form.Item>

            <Form.Item name="saveToLocalStorage" valuePropName="checked">
              <Checkbox>Save to Local Storage</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                Connect
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}; 
