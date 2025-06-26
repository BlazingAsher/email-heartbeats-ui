import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_API_TOKENS, CREATE_API_TOKEN, UPDATE_API_TOKEN, DELETE_API_TOKEN } from '../graphql/queries';
import type { ApiToken } from '../graphql/schema';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

export const ApiTokens: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingToken, setEditingToken] = useState<ApiToken | null>(null);
  const [form] = Form.useForm();

  const { data, loading, refetch } = useQuery(GET_API_TOKENS);
  
  const [createToken] = useMutation(CREATE_API_TOKEN);
  const [updateToken] = useMutation(UPDATE_API_TOKEN);
  const [deleteToken] = useMutation(DELETE_API_TOKEN);

  const handleCreate = () => {
    setEditingToken(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: ApiToken) => {
    setEditingToken(record);
    form.setFieldsValue({
      access_controls: record.access_controls,
      description: record.description,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteToken({ variables: { id } });
      message.success('API token deleted successfully');
      refetch();
    } catch (error) {
      message.error('Failed to delete API token');
      console.error(error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingToken) {
        await updateToken({
          variables: {
            id: editingToken.id,
            ...values,
          },
        });
        message.success('API token updated successfully');
      } else {
        await createToken({ variables: values });
        message.success('API token created successfully');
      }
      setIsModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Failed to save API token');
      console.error(error);
    }
  };

  const columns: ColumnsType<ApiToken> = [
    {
      title: 'Token ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Text code copyable={{ text: id }}>{id.substring(0, 12)}...</Text>
      ),
    },
    {
      title: 'Access Controls',
      dataIndex: 'access_controls',
      key: 'access_controls',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this API token?"
            onConfirm={() => handleDelete(record.id)}
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
          Create API Token
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.apiTokens || []}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingToken ? 'Edit API Token' : 'Create API Token'}
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
            label="Access Controls"
            name="access_controls"
            rules={[{ required: true, message: 'Please enter access controls' }]}
            help="Define permissions for this token (e.g., read:heartbeats, write:endpoints)"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            help="A description to help identify this token's purpose"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingToken ? 'Update' : 'Create'}
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