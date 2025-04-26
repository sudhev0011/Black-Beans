import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useVerifyOTPMutation, useResendOTPMutation, useVerifyResetOTPMutation } from '@/store/api/userApiSlice';

export function VeryOtp() {
  const [value, setValue] = useState('');
  const length = value.length === 6;
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const isReset = location.state?.isReset || false;

  const [verifyOTP, { isLoading: isVerifyingSignup }] = useVerifyOTPMutation();
  const [verifyResetOTP, { isLoading: isVerifyingReset }] = useVerifyResetOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      if (!email) {
        toast.error('Email not provided');
        navigate(isReset ? '/auth/forget-password' : '/auth/register');
      }
      setHasLoaded(true);
    }

    const timer = setInterval(() => {
      setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate, hasLoaded, isReset]);

  const handleSubmit = async () => {
    try {
      const mutation = isReset ? verifyResetOTP : verifyOTP;
      const response = await mutation({ email, otp: value }).unwrap();
      if (response.success) {
        toast.success(response.message);
        localStorage.removeItem('verifyEmail');
        navigate('/');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'OTP verification failed');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await resendOTP({ email }).unwrap();
      if (response.success) {
        toast.success(response.message);
        setTotalSeconds(60);
        setValue('');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to resend OTP');
    }
  };

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="verify-otp mx-auto w-full" style={{ maxWidth: '310px' }}>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-8">
        Verify OTP {isReset ? 'for Password Reset' : 'for Signup'}
      </h1>
      <InputOTP
        maxLength={6}
        value={value}
        onChange={(value) => setValue(value)}
        pattern={REGEXP_ONLY_DIGITS}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} className="border-gray-300 w-11 h-12" />
          <InputOTPSlot index={1} className="border-gray-300 w-11 h-12" />
          <InputOTPSlot index={2} className="border-gray-300 w-11 h-12" />
          <InputOTPSlot index={3} className="border-gray-300 w-11 h-12" />
          <InputOTPSlot index={4} className="border-gray-300 w-11 h-12" />
          <InputOTPSlot index={5} className="border-gray-300 w-11 h-12" />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-gray-800 mb-2 font-bold mt-3" style={{ fontSize: '11px' }}>
        {minutes.toString().padStart(2, '0')} : {seconds.toString().padStart(2, '0')}
      </p>
      {totalSeconds === 0 && (
        <Button
          variant="link"
          className="text-primary mb-3 font-semibold p-0"
          onClick={handleResendOtp}
          disabled={isResending}
        >
          {isResending ? 'Resending...' : 'Resend'}
        </Button>
      )}
      <p className="text-gray-800 mb-1" style={{ fontSize: '10px' }}>
        By clicking on Verify button you agree to our{' '}
        <Link className="text-primary">Terms & Conditions</Link>
      </p>
      <Button
        className="w-full font-bold"
        onClick={handleSubmit}
        disabled={!length || isVerifyingSignup || isVerifyingReset}
      >
        {(isVerifyingSignup || isVerifyingReset) ? 'Verifying...' : 'Verify'}
      </Button>
    </div>
  );
}

export default VeryOtp;