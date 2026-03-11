import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb"
import { Separator } from "./ui/separator"
import { Menu, Sun, Moon, PanelLeft, MessageSquare } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from '../context/ThemeContext'
import { useSidebar } from '../context/SidebarContext'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

function AppHeader({ onSidebarToggle, sidebarCollapsed = false, onChatToggle }) {
  const { isDark, toggleTheme } = useTheme();
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

  // Generate breadcrumb based on current route
  const generateBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Add home
    breadcrumbs.push({
      label: 'Home',
      href: '/',
      isLast: pathSegments.length === 0
    });

    // Add other segments
    if (pathSegments.length > 0) {
      let currentPath = '';
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        
        // Format segment name
        let label = segment.charAt(0).toUpperCase() + segment.slice(1);
        if (segment === 'farmer' || segment === 'admin' || segment === 'agronomist' || segment === 'retailer') {
          label = `${label} Dashboard`;
        }
        
        breadcrumbs.push({
          label,
          href: currentPath,
          isLast
        });
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumb();

  return (
    <>
      <header className={cn(
        "fixed top-0 right-0 z-30 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear bg-background border-b",
        "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        collapsed ? "left-16" : "left-64"
      )}>
        <div className="flex items-center gap-2 px-4 flex-1">
          {/* Sidebar Collapse Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-1 hover:bg-transparent"
            onClick={toggle}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>

          <Separator
            orientation="vertical"
            className="mr-2 h-4"
          />

          

          <Separator
            orientation="vertical"
            className="mr-2 h-4"
          />

          {/* Breadcrumb */}
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.href}>
                  <BreadcrumbItem className={cn("hidden md:block", breadcrumb.isLast && "block")}>
                    {breadcrumb.isLast ? (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!breadcrumb.isLast && (
                    <BreadcrumbSeparator className={cn("hidden md:block", index === breadcrumbs.length - 2 && "block")} />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

           {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="hover:bg-transparent"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
        >
          {isDark ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-indigo-500" />
          )}
          <span className="sr-only">Toggle Theme</span>
        </Button>

        <Separator
          orientation="vertical"
          className="mr-2 h-4"
        />

          {/* Chat Button */}
          {user && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="p-2 rounded-lg bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-colors relative"
              onClick={onChatToggle}
              title="Open Chat"
            >
              <MessageSquare size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span className="sr-only">Open Chat</span>
            </Button>
          )}
        </div>
      </header>
    </>
  )
}

export default AppHeader;
