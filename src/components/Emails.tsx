import React, { useState } from 'react';
import { Table, Button, Space, InputNumber, DatePicker, Card, Modal, message, Typography, Tag } from 'antd';
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EMAILS, DELETE_EMAILS_OLDER_THAN } from '../graphql/queries';
import type { Email } from '../graphql/schema';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { formatDuration } from '../utils/formatDuration';

const { Text, Paragraph } = Typography;

export const Emails: React.FC = () => {
  const [limit, setLimit] = useState(50);
  const [newerThan, setNewerThan] = useState<number | undefined>(undefined);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteBeforeDate, setDeleteBeforeDate] = useState<dayjs.Dayjs | null>(null);

  const { data, loading, refetch } = useQuery(GET_EMAILS, {
    variables: {
      limit,
      newer_than: newerThan
    }
  });

  const [deleteEmailsOlderThan, { loading: deleteLoading }] = useMutation(DELETE_EMAILS_OLDER_THAN);

  const handleRefresh = () => {
    refetch({
      limit,
      newer_than: newerThan
    });
  };

  const handleDeleteOldEmails = async () => {
    if (!deleteBeforeDate) {
      message.error('Please select a date');
      return;
    }

    try {
      const timestamp = deleteBeforeDate.unix();
      const result = await deleteEmailsOlderThan({ variables: { timestamp } });
      const deletedCount = result.data?.deleteEmailsOlderThan || 0;
      message.success(`Deleted ${deletedCount} emails older than ${deleteBeforeDate.format('YYYY-MM-DD')}`);
      setDeleteModalVisible(false);
      setDeleteBeforeDate(null);
      refetch();
    } catch (error) {
      message.error('Failed to delete emails');
      console.error(error);
    }
  };

  const columns: ColumnsType<Email> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Received',
      dataIndex: 'received_time',
      key: 'received_time',
      width: 180,
      render: (timestamp: number) => dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => a.received_time - b.received_time,
      defaultSortOrder: 'descend',
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
      ellipsis: true,
    },
    {
      title: 'To',
      dataIndex: 'to',
      key: 'to',
      ellipsis: true,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Heartbeat',
      dataIndex: 'heartbeat',
      key: 'heartbeat',
      width: 180,
      render: (heartbeat: Email['heartbeat']) => 
        heartbeat ? (
          <Tag color="green">{heartbeat.email_name}</Tag>
        ) : (
          <Tag>None</Tag>
        ),
    },
  ];

  const expandedRowRender = (record: Email) => {
    return (
      <div style={{ padding: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Body:</Text>
            <Paragraph
              style={{ 
                marginTop: 8, 
                padding: '12px', 
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflow: 'auto'
              }}
            >
              {record.body}
            </Paragraph>
          </div>
          {record.heartbeat && (
            <div>
              <Text strong>Associated Heartbeat:</Text>
              <div style={{ marginTop: 8 }}>
                <Text>Email Name: {record.heartbeat.email_name}</Text><br />
                <Text>Last Heartbeat: {record.heartbeat.last_heartbeat ? 
                  dayjs.unix(record.heartbeat.last_heartbeat).format('YYYY-MM-DD HH:mm:ss') : 
                  'Never'
                }</Text><br />
                <Text>Interval: {formatDuration(record.heartbeat.max_heartbeat_interval_seconds)}</Text>
              </div>
            </div>
          )}
        </Space>
      </div>
    );
  };

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <div>
            <Text>Limit:</Text>
            <InputNumber
              min={1}
              max={1000}
              value={limit}
              onChange={(value) => setLimit(value || 50)}
              style={{ marginLeft: 8, width: 100 }}
            />
          </div>
          <div>
            <Text>Newer than:</Text>
            <DatePicker
              showTime
              placeholder="Select date"
              onChange={(date) => setNewerThan(date ? date.unix() : undefined)}
              style={{ marginLeft: 8 }}
            />
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            type="primary"
          >
            Refresh
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModalVisible(true)}
            danger
          >
            Delete Old Emails
          </Button>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={data?.emails || []}
        loading={loading}
        rowKey="id"
        pagination={{ 
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} emails`
        }}
        expandable={{
          expandedRowRender,
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <Button size="small" onClick={e => onExpand(record, e)} style={{ padding: '0 8px' }}>Hide</Button>
            ) : (
              <Button size="small" onClick={e => onExpand(record, e)} style={{ padding: '0 8px' }}>View</Button>
            ),
          expandIconColumnIndex: 0,
          columnWidth: 80
        }}
        scroll={{ x: 1100 }}
      />

      <Modal
        title="Delete Old Emails"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteBeforeDate(null);
        }}
        onOk={handleDeleteOldEmails}
        confirmLoading={deleteLoading}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Select a date to delete all emails received before this date:</Text>
          <DatePicker
            showTime
            placeholder="Select date and time"
            value={deleteBeforeDate}
            onChange={setDeleteBeforeDate}
            style={{ width: '100%' }}
          />
          {deleteBeforeDate && (
            <Text type="warning">
              This will permanently delete all emails received before {deleteBeforeDate.format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          )}
        </Space>
      </Modal>
    </>
  );
}; 