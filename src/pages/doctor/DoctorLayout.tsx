import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useStaffSession } from "@/hooks/useStaffSession";
import { LayoutDashboard, Users, Stethoscope, Clock, UserCheck, LogOut, Heart, ChevronLeft, ChevronRight } from "lucide-react";

const links = [
  { label: "Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Patient Queue", path: "/doctor/queue", icon: Users },
  { label: "Consultations", path: "/doctor/consultations", icon: Stethoscope },
  { label: "My Schedule", path: "/doctor/schedule", icon: Clock },
  { label: "My Patients", path: "/doctor/patients", icon: UserCheck },
];

const DoctorLayout = () => {
  const { session, logout } = useStaffSession("doctor");
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
              <span className="text-sm font-bold text-sidebar-foreground">Doctor</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="rounded p-1 text-sidebar-foreground hover:bg-sidebar-accent">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                location.pathname === l.path
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
              }`}
            >
              <l.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{l.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-2">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-background"><div className="p-6"><Outlet /></div></main>
    </div>
  );
};

export default DoctorLayout;
