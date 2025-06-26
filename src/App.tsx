import React from 'react';
import { ConfigProvider } from './context/ConfigContext';
import { useConfig } from './context/ConfigContext';
import { ApolloProvider } from './components/ApolloProvider';
import { SetupScreen } from './components/SetupScreen';
import { Dashboard } from './components/Dashboard';
import { ConfigProvider as AntdConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

const AppContent: React.FC = () => {
  const { isConnected } = useConfig();

  if (!isConnected) {
    return <SetupScreen />;
  }

  return (
    <ApolloProvider>
      <Dashboard />
    </ApolloProvider>
  );
};

function App() {
  return (
    <AntdConfigProvider>
      <ConfigProvider>
        <AppContent />
      </ConfigProvider>
    </AntdConfigProvider>
  );
}

export default App;
