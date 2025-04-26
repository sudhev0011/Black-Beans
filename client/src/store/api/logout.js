import { useLogoutMutation } from "./userApiSlice"; // Assuming the mutation is imported correctly

export const useLogoutUser = () => {
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const logoutUser = async () => {
    try {
      const response = await logout().unwrap();
      return response;  // return the response
    } catch (error) {
      console.error('Logout failed:', error);  // handle any errors
      return null;
    }
  };

  return { logoutUser, isLogoutLoading };
};
