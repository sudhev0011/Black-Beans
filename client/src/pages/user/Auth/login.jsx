import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FaUserAstronaut } from 'react-icons/fa';
import { useLoginMutation, useGoogleLoginMutation } from '@/store/api/userApiSlice';
import { useAdminLoginMutation } from '@/store/api/adminApiSlice';
import Form from '@/components/form/Form';
import { loginFormControls } from '@/config';
import { setUserCredentials } from '@/store/slices/userSlice/userSlice';

const initialState = { email: '', password: '' };
const admin = { email: 'sudhevsuresh@gmail.com', password: 'Sudhev123' };
const user = { email: 'aswinskumar26@gmail.com', password: 'aswinskumar26@gmail.com' };

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [adminLogin] = useAdminLoginMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await googleLogin({ token: credentialResponse.credential }).unwrap();
      if (response.success) {
        dispatch(setUserCredentials(response.user));
        navigate('/');
        toast.success('Successfully logged in with Google!');
      } else {
        toast.error(response.message || 'Google login failed');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Google authentication failed');
    }
  };

  const onGoogleFailure = () => {
    toast.error('Google login failed');
  };

  async function onSubmit(event) {
    event.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.info('Please fill in all the required fields', {
        description: 'Email and Password are required',
      });
      return;
    }

    try {
      const response = await login(formData).unwrap();
      if (response.success) {
        dispatch(setUserCredentials(response.user));
        toast.success(response.message);
        navigate('/');
      } else if (response.isVerify) {
        navigate('/auth/verify-email', { state: { email: formData.email } });
        toast.info(response.message);
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed');
    }
  }

  async function handleDemoLogin(demoCredentials) {
    try {
      const response = await login(demoCredentials).unwrap();
      if (response.success) {
        dispatch(setUserCredentials(response.user));
        toast.success(response.message);
        navigate('/');
      } else if (response.isVerify) {
        navigate('/auth/verify-email', { state: { email: demoCredentials.email } });
        toast.info(response.message);
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Demo login failed');
    }
  }

  async function handleAdminDemoLogin(demoCredentials) {
    try {
      const response = await adminLogin(demoCredentials).unwrap();
      if (response.success) {
        dispatch(setAdminCredentials(response.admin));
        toast.success(response.message);
        navigate('/admin');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Admin Demo login failed');
    }
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="mx-auto w-full max-w-md space-y-6" style={{ maxWidth: '310px' }}>
        <div className="text-center">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleFailure}
            render={(renderProps) => (
              <Button
                className="w-full mb-4 bg-transparent hover:bg-transparent text-black outline outline-1 outline-gray-200"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled || isLoading || isGoogleLoading}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="mr-2"
                  style={{ width: '20px', height: '20px' }}
                />
                <p className="text-sm font-medium">Continue with Google</p>
              </Button>
            )}
          />
        </div>
        <div className="flex items-center justify-center" style={{ marginTop: '13px' }}>
          <div className="w-full border-t border-gray-300"></div>
          <div className="mx-3 text-gray-500" style={{ fontSize: '12px' }}>OR</div>
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <Form
          formControls={loginFormControls}
          buttonText={isLoading ? 'Signing In...' : 'Sign In'}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          formType="login"
        />
        <p className="text-md text-center text-gray-900">
          Don't have an account
          <Link className="font-medium ml-2 text-primary hover:underline" to="/auth/register">
            Register
          </Link>
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={() => handleDemoLogin(user)}
            disabled={isLoading}
          >
            <FaUserAstronaut style={{ width: '15px', height: '15px' }} /> Demo User
          </Button>
          {/* <Button
            variant="outline"
            className="w-1/2"
            onClick={() => handleAdminDemoLogin(admin)}
            disabled={isLoading}
          >
            <MdAdminPanelSettings style={{ width: '20px', height: '20px' }} /> Demo Admin
          </Button> */}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default AuthLogin;