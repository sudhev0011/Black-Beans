import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import Form from "@/components/form/form";
import { Button } from "@/components/ui/button";
import DotLoading from "@/components/ui/DotLoading";
import { registerFormControls } from "@/config";
import { toast } from "sonner";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useSignupMutation ,useGoogleLoginMutation} from "@/store/api/userApiSlice";
import { setUserCredentials } from '@/store/slices/userSlice/userSlice';
import { useDispatch } from 'react-redux';

const initialState = {
  username: "",
  email: "",
  password: "",
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch()
  const [signup, { isLoading }] = useSignupMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();

    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.info("Please fill in all required fields", {
        description: "Username, email, and password are required",
      });
      return;
    }

    if (formData.username.trim() === "") {
      toast.info("Missing Username", {
        description: "Please enter your name.",
      });
      return;
    }

    if (formData.username.trim().length < 3) {
      toast.info("Username Too Short", {
        description: "Username must be at least 3 characters long.",
      });
      return;
    }

    if (formData.email.trim() === "") {
      toast.info("Missing email", {
        description: "Please enter your email.",
      });
      return;
    }

    if (!emailRegex.test(formData.email.trim())) {
      toast.info("Invalid Email", {
        description: "Please enter a valid email address.",
      });
      return;
    }

    if (formData.password.trim() === "") {
      toast.info("Missing Password", {
        description: "Password is required.",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast.info("Weak Password", {
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    //     // if (!passwordRegex.test(formData.password.trim())) {
    //     //   toast.info("Weak Password", {
    //     //     description: "Password must be at least 8 characters long and contain both letters and numbers."
    //     //   });
    //     //   return;
    //     // }

    try {
      const response = await signup(formData).unwrap();
      if (response.success) {
        toast.success(response.message);
        localStorage.setItem("verifyEmail", formData.email);
        navigate("/auth/verify-email", { state: { email: formData.email } });
      }
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
    }
  }

  const onGoogleSuccess = async (credentialResponse) => {
      console.log('Credential Response:', credentialResponse);
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
        console.error(error);
      }
    };


    const onGoogleFailure = () => {
        toast.error('Google login failed');
      };  

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <div className="mx-auto w-full space-y-6" style={{ maxWidth: "310px" }}>
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
      <div className="text-center">
      </div>
      <div
        className="flex items-center justify-center"
        style={{ marginTop: "13px" }}
      >
        <div className="w-full border-t border-gray-300"></div>
        <div className="mx-3 text-gray-500" style={{ fontSize: "12px" }}>
          OR
        </div>
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <Form
        formControls={registerFormControls}
        buttonText={isLoading ? <DotLoading text="Signing Up" /> : "Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        formType="register"
      />
      <p className="mt-2 text-center text-md text-gray-900">
        Already have an account
        <Link
          className="font-medium ml-2 text-primary hover:underline"
          to="/auth/login"
        >
          Login
        </Link>
      </p>
    </div>
    </GoogleOAuthProvider>);
}

export default AuthRegister;
