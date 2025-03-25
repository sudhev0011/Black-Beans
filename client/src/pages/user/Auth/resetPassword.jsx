import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import Form from '@/components/form/form';
import { resetPasswordFormControls } from '@/config';
import { useResetPasswordMutation } from '@/store/api/userApiSlice';

const initialState = {
  password: '',
  confirmPassword: '',
};

function ResetPassword() {
  const [formData, setFormData] = useState(initialState);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('Email not provided');
      navigate('/auth/forget-password');
    }
  }, [email, navigate]);

  async function onSubmit(event) {
    event.preventDefault();

    if (formData.password.trim() === '') {
      toast.info('Missing Password', {
        description: 'Password is required.',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast.info('Weak Password', {
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await resetPassword({
        email,
        password: formData.password,
      }).unwrap();

      if (response.success) {
        toast.success(response.message);
        navigate('/auth/verify-email', { state: { email, isReset: true } });
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to initiate password reset');
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6" style={{ maxWidth: '310px' }}>
      <p className="text-sm text-muted-foreground">
        Please enter your new password below. An OTP will be sent to verify it.
      </p>
      <Form
        formControls={resetPasswordFormControls}
        buttonText={isLoading ? 'Submitting...' : 'Submit New Password'}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        formType="reset"
      />
    </div>
  );
}

export default ResetPassword;