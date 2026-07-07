import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ErrorContext, UserContext } from '../../../index';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Card, Typography } from 'antd';

function EnterForm({ action, user }) {
  const { userStore } = useContext(UserContext);
  const { errorStore } = useContext(ErrorContext);
  const { errorData } = errorStore;
  const { Title, Text } = Typography;

  const onFinish = values => {
    action === 'login' ? userStore.login(values) : userStore.registration(values);
    localStorage.setItem(
      'user',
      JSON.stringify({
        email: values.email,
        remember: values.remember,
      }),
    );
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card>
        <div style={{ marginBottom: '10px' }}>
          <Title level={4}>
            <b>Welcome!</b>
          </Title>
          <Text type="secondary">
            {action === 'login' ? 'Login to continue' : 'Signup to continue'}
          </Text>
        </div>
        <Form
          name="login"
          initialValues={
            action === 'login'
              ? { email: user.remember ? user.email : '', remember: user.remember }
              : { remember: true }
          }
          style={{ width: 360 }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!', type: 'email' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="username@mail.com" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>
          <div>
            <Form.Item
              name="remember"
              valuePropName="checked"
              style={{ visibility: 'visible', marginBottom: 10 }}
            >
              <Checkbox style={{ visibility: 'visible' }}>
                <Text type="secondary">Remember me</Text>
              </Checkbox>
            </Form.Item>
            {action === 'login' ? (
              <div style={{ marginBottom: 10 }}>
                <Button type="link" style={{ padding: 0 }}>
                  Forgot password
                </Button>
              </div>
            ) : null}
          </div>

          <Form.Item>
            <Button block type="primary" htmlType="submit" style={{ marginBottom: '10px' }}>
              {action === 'login' ? 'Login' : 'Signup'}
            </Button>
            <Text type="secondary">
              {action === 'login' ? 'Already have an account?' : "Don't have an account?"}
            </Text>{' '}
            {action === 'login' ? (
              <NavLink to="/signup">Signup</NavLink>
            ) : (
              <NavLink to="/">Login</NavLink>
            )}
          </Form.Item>
        </Form>
        {errorData.status && <Text type="danger">{errorData.message}</Text>}
      </Card>
    </div>
  );
}

export default observer(EnterForm);
