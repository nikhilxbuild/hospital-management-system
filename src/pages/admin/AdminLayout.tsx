import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useStaffSession } from "@/hooks/useStaffSession";
import {
  LayoutDashboard, CalendarDays, Clock, Users, Receipt,
  MessageSquare, LogOut, Heart, ChevronLeft, ChevronRight, UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Appointments", path: "/admin/appointments", icon: CalendarDays },
  
  { label: "Doctor Schedules", path: "/admin/schedules", icon: Clock },
  { label: "Doctors", path: "/admin/doctors", icon: UserCog },
  { label: "Patients", path: "/admin/patients", icon: Users },
  { label: "Billing", path: "/admin/billing", icon: Receipt },
  { label: "SMS Log", path: "/admin/sms", icon: MessageSquare },
];

const AdminLayout = () => {
  const { session, logout } = useStaffSession("admin");
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!session) return null;

  return (
    <div className="flex min-h-screen">
      <aside className={`${collapsed ? "w-16" : "w-60"} flex flex-col border-r bg-sidebar transition-all`}>
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-sidebar-primary" />
              <span className="text-sm font-bold text-sidebar-foreground">RK Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="rounded p-1 text-sidebar-foreground hover:bg-sidebar-accent">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {adminLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                location.pathname === l.path
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <l.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{l.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
