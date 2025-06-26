import React, { useState } from 'react';
import { Card, Form, Input, Checkbox, Button, Space, Typography } from 'antd';
import { ApiOutlined, KeyOutlined } from '@ant-design/icons';
import { useConfig } from '../context/ConfigContext';

const { Title, Text } = Typography;

export const SetupScreen: React.FC = () => {
  const { endpoint, apiToken, saveToLocalStorage, setConfig } = useConfig();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleConnect = async (values: any) => {
    setLoading(true);
    try {
      // You could add a test query here to validate the connection
      setConfig(values.endpoint, values.apiToken, values.saveToLocalStorage);
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
            <Title level={2}>Email Heartbeats Setup</Title>
            <Text type="secondary">Configure your GraphQL connection</Text>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleConnect}
            initialValues={{
              endpoint: endpoint || '',
              apiToken: apiToken || '',
              saveToLocalStorage: saveToLocalStorage
            }}
          >
            <Form.Item
              label="GraphQL Endpoint"
              name="endpoint"
              rules={[
                { required: true, message: 'Please enter the GraphQL endpoint URL' },
                { type: 'url', message: 'Please enter a valid URL' }
              ]}
            >
              <Input
                prefix={<ApiOutlined />}
                placeholder="https://api.example.com/graphql"
                size="large"
              />
            </Form.Item>

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