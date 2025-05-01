import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { MdAdminPanelSettings } from 'react-icons/md';
import { useAdminLoginMutation } from '@/store/api/adminApiSlice';
import Form from '@/components/form/Form';
import { loginFormControls } from '@/config';
import { setAdminCredentials } from '@/store/slices/adminSlice/adminSlice';

const initialState = { email: '', password: '' };
const adminDemo = { email: 'sudhevsuresh@gmail.com', password: 'Sudhev123' };

function AdminLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const navigate = useNavigate();
  const admin = useSelector((state) => state.admin.admin);

  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  async function onSubmit(event) {
    event.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.info('Please fill in all the required fields', {
        description: 'Email and Password are required',
      });
      return;
    }

    try {
      const response = await adminLogin(formData).unwrap();
      if (response.success) {
        dispatch(setAdminCredentials(response.admin));
        toast.success(response.message || 'Admin login successful');
      } else {
        toast.error(response.message || 'Admin login failed');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Admin login failed');
      console.error('Admin Login Error:', error);
    }
  }

  async function handleAdminDemoLogin(demoCredentials) {
    try {
      const response = await adminLogin(demoCredentials).unwrap();
      if (response.success) {
        dispatch(setAdminCredentials(response.admin));
        toast.success(response.message || 'Demo admin login successful');
      } else {
        toast.error(response.message || 'Demo admin login failed');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Demo admin login failed');
      console.error('Demo Admin Login Error:', error);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6" style={{ maxWidth: '310px' }}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
        <p className="mt-2 text-sm text-gray-600">Sign in to manage your store</p>
      </div>
      <Form
        formControls={loginFormControls}
        buttonText={isLoading ? 'Signing In...' : 'Sign In'}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        formType="login"
      />
      <div className="flex justify-center">
        <Button
          variant="outline"
          className="w-1/2"
          onClick={() => handleAdminDemoLogin(adminDemo)}
          disabled={isLoading}
        >
          <MdAdminPanelSettings style={{ width: '20px', height: '20px', marginRight: '8px' }} />
          Demo Admin
        </Button>
      </div>
      <p className="text-md text-center text-gray-900">
        Back to{' '}
        <Link className="font-medium ml-2 text-primary hover:underline" to="/auth/login">
          User Login
        </Link>
      </p>
    </div>
  );
}

export default AdminLogin;