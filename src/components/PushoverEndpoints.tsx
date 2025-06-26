import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PUSHOVER_ENDPOINTS, CREATE_PUSHOVER_ENDPOINT, UPDATE_PUSHOVER_ENDPOINT } from '../graphql/queries';
import type { PushoverEndpoint } from '../graphql/schema';
import type { ColumnsType } from 'antd/es/table';

export const PushoverEndpoints: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<PushoverEndpoint | null>(null);
  const [form] = Form.useForm();

  const { data, loading, refetch } = useQuery(GET_PUSHOVER_ENDPOINTS);
  
  const [createEndpoint] = useMutation(CREATE_PUSHOVER_ENDPOINT);
  const [updateEndpoint] = useMutation(UPDATE_PUSHOVER_ENDPOINT);

  const handleCreate = () => {
    setEditingEndpoint(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: PushoverEndpoint) => {
    setEditingEndpoint(record);
    form.setFieldsValue({
      user_key: record.user_key,
      timezone: record.timezone,
      description: record.description,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingEndpoint) {
        await updateEndpoint({
          variables: {
            id: editingEndpoint.id,
            ...values,
          },
        });
        message.success('Endpoint updated successfully');
      } else {
        await createEndpoint({ variables: values });
        message.success('Endpoint created successfully');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Failed to save endpoint');
      console.error(error);
    }
  };

  const columns: ColumnsType<PushoverEndpoint> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'User Key',
      dataIndex: 'user_key',
      key: 'user_key',
    },
    {
      title: 'Timezone',
      dataIndex: 'timezone',
      key: 'timezone',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          size="small"
        >
          Edit
        </Button>
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
          Create Endpoint
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.pushoverEndpoints || []}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingEndpoint ? 'Edit Pushover Endpoint' : 'Create Pushover Endpoint'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="User Key"
            name="user_key"
            rules={[{ required: true, message: 'Please enter user key' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Timezone"
            name="timezone"
            rules={[{ required: true, message: 'Please enter timezone' }]}
          >
            <Input placeholder="e.g., America/New_York" />
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
                {editingEndpoint ? 'Update' : 'Create'}
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