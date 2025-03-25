import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { BarChart3, ShieldUser, ShoppingCart, Tag, Users, FileText, Ticket, Search, Bell, Package } from 'lucide-react';
import { useAdminLogoutMutation } from '@/store/api/adminApiSlice';
import { logoutAdmin } from '@/store/slices/adminSlice/adminSlice';
import { toast } from 'sonner';

export default function AdminPanel() {
  const admin = useSelector((state) => state.admin.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const [logout, { isLoading }] = useAdminLogoutMutation();

  const handleLogout = async () => {
    try {
      const response = await logout().unwrap();
      if (response.success) {
        dispatch(logoutAdmin());
        toast.success('Admin logged out successfully');
        navigate('/auth/admin-login');
      } else {
        toast.error(response.message || 'Logout failed');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Logout failed');
      console.error('Admin Logout Error:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getBreadcrumbItems = () => {
    const path = location.pathname.split('/admin/')[1] || 'dashboard';
    switch (path) {
      case 'dashboard':
      case '':
        return [{ label: 'Dashboard', href: '/admin/dashboard' }];
      case 'products':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Product Management', href: '/admin/products' },
        ];
      case 'categories':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Category Management', href: '/admin/categories' },
        ];
      case 'users':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'User Management', href: '/admin/users' },
        ];
      case 'orders':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Order Management', href: '/admin/orders' },
        ];
      case 'reports':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Sales Reports', href: '/admin/reports' },
        ];
      case 'coupons':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Coupon Management', href: '/admin/coupons' },
        ];
      default:
        return [{ label: 'Dashboard', href: '/admin/dashboard' }];
    }
  };

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <Sidebar>
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              <ShieldUser className="h-6 w-6" />
              <span className="text-xl font-bold">Black Beans Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation('/admin/dashboard')}
                      isActive={location.pathname === '/admin' || location.pathname === '/admin/dashboard'}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Catalog</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation('/admin/products')}
                      isActive={location.pathname === '/admin/products'}
                    >
                      <Package className="h-4 w-4" />
                      <span>Product Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation('/admin/categories')}
                      isActive={location.pathname === '/admin/categories'}
                    >
                      <Tag className="h-4 w-4" />
                      <span>Category Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Sales</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation('/admin/orders')}
                      isActive={location.pathname === '/admin/orders'}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Order Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation('/admin/coupons')}
                      isActive={location.pathname === '/admin/coupons'}
                    >
                      <Ticket className="h-4 w-4" />
                      <span>Coupon Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Users</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation('/admin/users')}
                      isActive={location.pathname === '/admin/users'}
                    >
                      <Users className="h-4 w-4" />
                      <span>User Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Reports</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation('/admin/reports')}
                      isActive={location.pathname === '/admin/reports'}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Sales Reports</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              <img
                src={admin?.image_url || '/placeholder.svg?height=32&width=32'}
                alt="Admin"
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium">{admin?.email || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">admin@blackbeans.com</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
            <SidebarTrigger className="lg:hidden" />
            <div className="w-full flex-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  {getBreadcrumbItems().map((item, index) => (
                    <BreadcrumbItem key={index}>
                      <BreadcrumbLink href={item.href}>/ {item.label}</BreadcrumbLink>
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              <form className="hidden md:block">
                {/* <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search..." className="w-64 pl-8 md:w-80" />
                </div> */}
              </form>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <img
                      src={admin?.image_url || '/placeholder.svg?height=32&width=32'}
                      alt="Admin"
                      className="h-8 w-8 rounded-full"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')}>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet /> {/* Render nested admin routes here */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}