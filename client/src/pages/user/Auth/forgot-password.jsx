import Form from '@/components/form/form';
import { forgetFormControls } from '@/config';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgetPasswordMutation } from '@/store/api/userApiSlice';

const initialState = { email: '' };

function ForgetPassword() {
  const [formData, setFormData] = useState(initialState);
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();

    if (!formData.email.trim()) {
      toast.info('Please enter your email');
      return;
    }

    try {
      const response = await forgetPassword({ email: formData.email }).unwrap();
      if (response.success) {
        toast.success(response.message);
        navigate('/auth/reset-password', { state: { email: formData.email } });
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to verify email');
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6" style={{ maxWidth: '310px' }}>
      <p className="text-sm text-muted-foreground">
        Please enter the email address associated with your account to reset your password.
      </p>
      <Form
        formControls={forgetFormControls}
        buttonText={isLoading ? 'Verifying...' : 'Verify Email'}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        formType="forget"
      />
    </div>
  );
}

export default ForgetPassword;