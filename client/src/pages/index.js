import SignupForm from 'entities/signup/SignupForm';
import EditPost from 'features/post/editPost/EditPost';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const SignupAction = lazy(() => import('../entities/signup/SignupAction'));
const LoginAction = lazy(() => import('../entities/login/LoginAction'));

export const Routing = () => {
  return (
    <Routes>
      <Route exact path="/" element={<SignupAction />} />
      <Route exact path="/login" element={<LoginAction />} />
      <Route exact path="/signup" element={<SignupForm />} />
      <Route exact path="/posts/:id" element={<EditPost />} />
    </Routes>
  );
};
