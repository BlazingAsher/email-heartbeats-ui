import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tooltip, DatePicker, Tag, Dropdown, Switch } from 'antd';
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, HeartOutlined, MailOutlined, MoreOutlined, ExclamationCircleOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import dayjs from 'dayjs';
import { GET_HEARTBEATS, GET_PUSHOVER_ENDPOINTS, CREATE_HEARTBEAT, UPDATE_HEARTBEAT, DELETE_HEARTBEAT, RECORD_HEARTBEAT } from '../graphql/queries';
import type { Heartbeat, PushoverEndpoint } from '../graphql/schema';
import type { ColumnsType } from 'antd/es/table';
import { formatDuration } from '../utils/formatDuration';
import { left, right } from '../constants/names';

export const Heartbeats: React.FC<{ onViewMessages?: (emailName: string) => void }> = ({ onViewMessages }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHeartbeat, setEditingHeartbeat] = useState<Heartbeat | null>(null);
  const [showDisabled, setShowDisabled] = useState(false);
  const [form] = Form.useForm();
  const indefinitelyDisabled = Form.useWatch('indefinitely_disabled', form);

  const { data, loading, refetch } = useQuery(GET_HEARTBEATS);
  const { data: endpointsData } = useQuery(GET_PUSHOVER_ENDPOINTS);

  const [createHeartbeat] = useMutation(CREATE_HEARTBEAT);
  const [updateHeartbeat] = useMutation(UPDATE_HEARTBEAT);
  const [deleteHeartbeat] = useMutation(DELETE_HEARTBEAT);
  const [recordHeartbeat] = useMutation(RECORD_HEARTBEAT);
  const [modal, contextHolder] = Modal.useModal();

  const displayedHeartbeats = (data?.heartbeats || []).filter(
    (h: Heartbeat) => showDisabled || !h.is_disabled
  );

  const handleCreate = () => {
    setEditingHeartbeat(null);
    form.resetFields();
    form.setFieldsValue({ always_forward: false, indefinitely_disabled: false });
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
      always_forward: record.always_forward,
      disabled_until: (record.disabled_until && record.disabled_until !== 0)
        ? dayjs(record.disabled_until * 1000)
        : null,
      indefinitely_disabled: record.disabled_until === 0,
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
      const { disabled_until: disabledUntilPicker, indefinitely_disabled, ...rest } = values || {};
      const disabled_until = indefinitely_disabled
        ? 0
        : disabledUntilPicker
        ? Math.floor(disabledUntilPicker.valueOf() / 1000)
        : null;

      // Ensure max_heartbeat_interval_seconds is always an integer
      let maxSeconds = rest?.max_heartbeat_interval_seconds;
      if (typeof maxSeconds === 'string') {
        const trimmed = maxSeconds.trim();
        if (trimmed.startsWith('=')) {
          message.error('Use the Compute button or enter a numeric value for Max Heartbeat Interval');
          return;
        }
        const parsed = parseInt(trimmed, 10);
        if (Number.isNaN(parsed)) {
          message.error('Max Heartbeat Interval must be an integer number of seconds');
          return;
        }
        rest.max_heartbeat_interval_seconds = parsed;
      }

      const variablesBase = {
        ...rest,
        disabled_until,
      };

      if (editingHeartbeat) {
        await updateHeartbeat({
          variables: {
            email_name: editingHeartbeat.email_name,
            ...variablesBase,
          },
        });
        message.success('Heartbeat updated successfully');
      } else {
        await createHeartbeat({
          variables: variablesBase,
        });
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
      sorter: (a, b) => a.email_name.localeCompare(b.email_name),
      defaultSortOrder: 'ascend',
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.is_disabled && record.disabled_until === 0) {
          return <Tag color="red">Disabled</Tag>;
        }
        if (record.is_disabled) {
          return (
            <Tooltip title={`Disabled until ${new Date(record.disabled_until! * 1000).toLocaleString()}`}>
              <Tag color="orange">Disabled until</Tag>
            </Tooltip>
          );
        }
        return <Tag color="green">Active</Tag>;
      },
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
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'messages',
            label: (
              <span>
                <MailOutlined /> Messages
              </span>
            ),
          },
          {
            key: 'record',
            label: (
              <span>
                <HeartOutlined /> Record heartbeat
              </span>
            ),
          },
          {
            key: 'toggle_disabled',
            label: (
              <span>
                {record.is_disabled ? <><CheckCircleOutlined /> Enable</> : <><StopOutlined /> Disable</>}
              </span>
            ),
          },
          {
            type: 'divider',
          },
          {
            key: 'edit',
            label: (
              <span>
                <EditOutlined /> Edit
              </span>
            ),
          },
          {
            key: 'delete',
            danger: true,
            label: (
              <span>
                <DeleteOutlined /> Delete
              </span>
            ),
          },
        ];
        return (
          <Dropdown
            menu={{
              items,
              onClick: async ({ key, domEvent }) => {
                domEvent.preventDefault();
                domEvent.stopPropagation();

                if (key === 'messages') {
                  onViewMessages?.(record.email_name);
                } else if (key === 'record') {
                  modal.confirm({
                    title: 'Record heartbeat?',
                    icon: <ExclamationCircleOutlined />,
                    content: `This will record a heartbeat for "${record.email_name}" at the current time.`,
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk: () => handleRecordHeartbeat(record.email_name),
                  });
                } else if (key === 'toggle_disabled') {
                  await updateHeartbeat({
                    variables: {
                      email_name: record.email_name,
                      disabled_until: record.is_disabled ? null : 0,
                    },
                  });
                  message.success(record.is_disabled ? 'Heartbeat enabled' : 'Heartbeat disabled');
                  refetch();
                } else if (key === 'edit') {
                  handleEdit(record);
                } else if (key === 'delete') {
                  modal.confirm({
                    title: 'Delete this heartbeat?',
                    icon: <ExclamationCircleOutlined />,
                    content: `Are you sure you want to delete "${record.email_name}"?`,
                    okText: 'Delete',
                    okButtonProps: { danger: true },
                    cancelText: 'Cancel',
                    onOk: () => handleDelete(record.email_name),
                  });
                }
              },
            }}
            trigger={['click']}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Heartbeat
          </Button>
<Space>
          <Switch
            checked={showDisabled}
            onChange={setShowDisabled}
                      />
<span>Show disabled</span>
          </Space>
        </Space>
      </div>

      {contextHolder}

      <Table
        columns={columns}
        dataSource={displayedHeartbeats}
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
            <Input
              disabled={!!editingHeartbeat}
              addonAfter={
                <button
                  type="button"
                  onClick={() => {
                    const leftName = left[Math.floor(Math.random() * left.length)];
                    const rightName = right[Math.floor(Math.random() * right.length)];
                    const randomNum = Math.floor(100 + Math.random() * 900); // 3 digit number
                    const generatedName = `${leftName}_${rightName}${randomNum}`;
                    form.setFieldsValue({ email_name: generatedName });
                  }}
                  style={{ padding: '0 6px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                >
                  Generate
                </button>
              }
            />
          </Form.Item>

          <Form.Item
            label="Max Heartbeat Interval (seconds)"
            name="max_heartbeat_interval_seconds"
            rules={[{ required: true, message: 'Please enter interval' }]}
          >
            <Input
              style={{ width: '100%' }}
              inputMode="numeric"
              pattern="[0-9]*"
              addonAfter={
                <button
                  type="button"
                  onClick={() => {
                    const val = form.getFieldValue('max_heartbeat_interval_seconds');
                    if (typeof val === 'string' && val.startsWith('=')) {
                      try {
                        const expr = val.substring(1).replace(/x/g, '*');
                        // eslint-disable-next-line no-eval
                        const result = eval(expr);
                        if (!isNaN(result) && isFinite(result)) {
                          form.setFieldsValue({ max_heartbeat_interval_seconds: parseInt(result.toString()) });
                        } else {
                          message.error('Invalid expression result');
                        }
                      } catch (e) {
                        message.error('Error evaluating expression');
                      }
                    } else {
                      message.info('Input must start with = to compute');
                    }
                  }}
                  style={{ padding: '0 6px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                >
                  Compute
                </button>
              }
            />
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
            label="Always forward"
            name="always_forward"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Indefinitely disabled"
            name="indefinitely_disabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {!indefinitelyDisabled && (
            <Form.Item
              label="Disabled until"
              name="disabled_until"
            >
              <DatePicker
                showTime
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}

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
