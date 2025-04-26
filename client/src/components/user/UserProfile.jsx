import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Mail, Phone, MapPin, Calendar } from "lucide-react";
import EditProfileComponent from "@/components/user/EditProfile";
import ChangePasswordComponent from "./ChangePassword";

const ProfileComponent = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  console.log("user data at user profile", user);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChanged = () => {
    setIsChangingPassword(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
  };

  if (isEditing) {
    return <EditProfileComponent onCancel={handleCancel} />;
  }
  
  if (isChangingPassword) {
    return <ChangePasswordComponent onCancel={handleCancel} onPasswordChanged={handlePasswordChanged} />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-2xl font-bold text-primary">
                My Profile
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsChangingPassword(true)}
                      variant="outline"
                      disabled={user?.googleId}
                      className="flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="whitespace-nowrap">Change Password</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user?.password === undefined ? 'Cannot change password due to Google login' : ''}</p>
                  </TooltipContent>
                </Tooltip>

                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>
            <CardDescription>
              Manage your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage
                    src={user?.image_url}
                    alt={user?.username}
                  />
                  <AvatarFallback className="text-2xl sm:text-3xl bg-primary text-white">
                    {user?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Badge className="bg-primary">
                  {isAuthenticated ? "Verified" : "Not Verified"}
                </Badge>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {user?.username || "John Doe"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base break-all">{user?.email || "john.doe@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base">{user?.phone || "+1 (555) 123-4567"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {user?.address || "123 Main St, New York, NY 10001"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base">Member since {user?.joinDate || "Jan 2022"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-primary">
              Account Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your orders and promotions
                </p>
              </div>
              <div className="flex items-center h-5">
                <input
                  id="email-notifications"
                  type="checkbox"
                  defaultChecked={user?.preferences?.emailNotifications}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive text messages for order updates
                </p>
              </div>
              <div className="flex items-center h-5">
                <input
                  id="sms-notifications"
                  type="checkbox"
                  defaultChecked={user?.preferences?.smsNotifications}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center h-5">
                <input
                  id="two-factor"
                  type="checkbox"
                  defaultChecked={user?.preferences?.twoFactorEnabled}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default ProfileComponent;