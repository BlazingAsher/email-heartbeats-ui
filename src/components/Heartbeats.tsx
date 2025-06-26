import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, HeartOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_HEARTBEATS, GET_PUSHOVER_ENDPOINTS, CREATE_HEARTBEAT, UPDATE_HEARTBEAT, DELETE_HEARTBEAT, RECORD_HEARTBEAT } from '../graphql/queries';
import type { Heartbeat, PushoverEndpoint } from '../graphql/schema';
import type { ColumnsType } from 'antd/es/table';
import { formatDuration } from '../utils/formatDuration';

export const Heartbeats: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHeartbeat, setEditingHeartbeat] = useState<Heartbeat | null>(null);
  const [form] = Form.useForm();

  const { data, loading, refetch } = useQuery(GET_HEARTBEATS);
  const { data: endpointsData } = useQuery(GET_PUSHOVER_ENDPOINTS);
  
  const [createHeartbeat] = useMutation(CREATE_HEARTBEAT);
  const [updateHeartbeat] = useMutation(UPDATE_HEARTBEAT);
  const [deleteHeartbeat] = useMutation(DELETE_HEARTBEAT);
  const [recordHeartbeat] = useMutation(RECORD_HEARTBEAT);

  const handleCreate = () => {
    setEditingHeartbeat(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Heartbeat) => {
    setEditingHeartbeat(record);
    form.setFieldsValue({
      email_name: record.email_name,
      max_heartbeat_interval_seconds: record.max_heartbeat_interval_seconds,
      matching_criteria: record.matching_criteria,
      endpoint_id: record.endpoint?.id,
      forwarding_token: record.forwarding_token,
      description: record.description,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (email_name: string) => {
    try {
      await deleteHeartbeat({ variables: { email_name } });
      message.success('Heartbeat deleted successfully');
      refetch();
    } catch (error) {
      message.error('Failed to delete heartbeat');
      console.error(error);
    }
  };

  const handleRecordHeartbeat = async (email_name: string) => {
    try {
      const result = await recordHeartbeat({ variables: { email_name } });
      const timestamp = result.data?.recordHeartbeat?.last_heartbeat;
      if (timestamp) {
        message.success(`Heartbeat recorded at ${new Date(timestamp * 1000).toLocaleString()}`);
      } else {
        message.success('Heartbeat recorded successfully');
      }
      refetch();
    } catch (error) {
      message.error('Failed to record heartbeat');
      console.error(error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingHeartbeat) {
        await updateHeartbeat({
          variables: {
            email_name: editingHeartbeat.email_name,
            ...values,
          },
        });
        message.success('Heartbeat updated successfully');
      } else {
        await createHeartbeat({ variables: values });
        message.success('Heartbeat created successfully');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Failed to save heartbeat');
      console.error(error);
    }
  };

  const columns: ColumnsType<Heartbeat> = [
    {
      title: 'Email Name',
      dataIndex: 'email_name',
      key: 'email_name',
    },
    {
      title: 'Last Heartbeat',
      dataIndex: 'last_heartbeat',
      key: 'last_heartbeat',
      render: (value) => value ? new Date(value * 1000).toLocaleString() : 'Never',
    },
    {
      title: 'Interval',
      dataIndex: 'max_heartbeat_interval_seconds',
      key: 'max_heartbeat_interval_seconds',
      render: (seconds: number) => (
        <Tooltip title={`${seconds.toLocaleString()} seconds`}>
          {formatDuration(seconds)}
        </Tooltip>
      ),
    },
    {
      title: 'Matching Criteria',
      dataIndex: 'matching_criteria',
      key: 'matching_criteria',
      ellipsis: true,
    },
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (endpoint: PushoverEndpoint | null) => endpoint?.description || endpoint?.user_key || '-',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size="small" wrap>
          <Popconfirm
            title="Are you sure you want to record a heartbeat?"
            description={`This will record a heartbeat for "${record.email_name}" at the current time.`}
            onConfirm={() => handleRecordHeartbeat(record.email_name)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<HeartOutlined />}
              size="small"
              type="primary"
            >
              Record
            </Button>
          </Popconfirm>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this heartbeat?"
            onConfirm={() => handleDelete(record.email_name)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Create Heartbeat
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.heartbeats || []}
        loading={loading}
        rowKey="email_name"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingHeartbeat ? 'Edit Heartbeat' : 'Create Heartbeat'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Email Name"
            name="email_name"
            rules={[{ required: true, message: 'Please enter email name' }]}
          >
            <Input disabled={!!editingHeartbeat} />
          </Form.Item>

          <Form.Item
            label="Max Heartbeat Interval (seconds)"
            name="max_heartbeat_interval_seconds"
            rules={[{ required: true, message: 'Please enter interval' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Matching Criteria"
            name="matching_criteria"
            rules={[{ required: true, message: 'Please enter matching criteria' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Pushover Endpoint"
            name="endpoint_id"
          >
            <Select allowClear placeholder="Select an endpoint">
              {endpointsData?.pushoverEndpoints?.map((endpoint: PushoverEndpoint) => (
                <Select.Option key={endpoint.id} value={endpoint.id}>
                  {endpoint.description || endpoint.user_key}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Forwarding Token"
            name="forwarding_token"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingHeartbeat ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}; 