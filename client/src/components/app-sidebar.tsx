import { Upload, Settings, Play, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { FaFacebook, FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const workflowSteps = [
  {
    title: "Upload CSV",
    path: "/",
    icon: Upload,
    step: 1,
  },
  {
    title: "Configure",
    path: "/configure",
    icon: Settings,
    step: 2,
  },
  {
    title: "Optimize",
    path: "/optimize",
    icon: Play,
    step: 3,
  },
  {
    title: "Results",
    path: "/results",
    icon: FileText,
    step: 4,
  },
];

const socialLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/abedelrahman.saleh/",
    icon: FaFacebook,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/abdurrahman-salih/",
    icon: FaLinkedin,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@salih_bi",
    icon: FaYoutube,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/salih_bi1",
    icon: FaInstagram,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <h1 className="text-lg font-semibold text-sidebar-foreground">
          Container Optimizer
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Load optimization tool
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workflow Steps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowSteps.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <a href={item.path} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <div className="flex items-center gap-3 w-full">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                            isActive 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {item.step}
                          </div>
                          <span>{item.title}</span>
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-6">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="https://analyzeforce.com/wp-content/uploads/2025/10/Asset-1.png"
            alt="Profile"
            className="w-16 h-16 rounded-full"
            data-testid="img-profile"
          />
          <div className="text-center">
            <p className="text-sm font-semibold text-sidebar-foreground">
              Business Intelligence Expert
            </p>
          </div>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid={`link-social-${social.name.toLowerCase()}`}
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
