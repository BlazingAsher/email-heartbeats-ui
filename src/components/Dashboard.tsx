import React, { useState } from 'react';
import { Layout, Tabs, Button, Space, Typography } from 'antd';
import { LogoutOutlined, HeartOutlined, BellOutlined, KeyOutlined, MailOutlined } from '@ant-design/icons';
import { useConfig } from '../context/ConfigContext';
import { Heartbeats } from './Heartbeats';
import { PushoverEndpoints } from './PushoverEndpoints';
import { ApiTokens } from './ApiTokens';
import { Emails } from './Emails';

const { Header, Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { disconnect, endpoint } = useConfig();
  const [activeTab, setActiveTab] = useState<string>('heartbeats');
  const [emailFilter, setEmailFilter] = useState<string | undefined>(undefined);
  const handleViewMessages = (emailName: string) => {
    setEmailFilter(emailName);
    setActiveTab('emails');
  };

  const items = [
    {
      key: 'heartbeats',
      label: (
        <span>
          <HeartOutlined /> Heartbeats
        </span>
      ),
      children: <Heartbeats onViewMessages={handleViewMessages} />,
    },
    {
      key: 'endpoints',
      label: (
        <span>
          <BellOutlined /> Pushover Endpoints
        </span>
      ),
      children: <PushoverEndpoints />,
    },
    {
      key: 'tokens',
      label: (
        <span>
          <KeyOutlined /> API Tokens
        </span>
      ),
      children: <ApiTokens />,
    },
    {
      key: 'emails',
      label: (
        <span>
          <MailOutlined /> Emails
        </span>
      ),
      children: <Emails preselectedEmailName={emailFilter} />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'auto',
        minHeight: '64px'
      }}>
        <Title level={3} style={{ margin: 0, fontSize: '18px' }}>Email Heartbeats</Title>
        <Space size="small" style={{ flexShrink: 0 }}>
          <Typography.Text 
            type="secondary" 
            style={{ fontSize: '12px' }}
            className="hide-on-mobile"
          >
            Connected to: {endpoint}
          </Typography.Text>
          <Button 
            icon={<LogoutOutlined />} 
            onClick={disconnect}
            type="text"
            size="small"
            title="Disconnect"
          >
            <span className="hide-on-mobile">Disconnect</span>
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key)}
          items={items}
          size="large"
          tabBarStyle={{ marginBottom: 16 }}
        />
      </Content>
    </Layout>
  );
}; 
