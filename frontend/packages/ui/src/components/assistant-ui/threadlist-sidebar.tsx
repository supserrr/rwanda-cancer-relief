import * as React from "react";
import { Plus, Search, Archive, MessageSquare, Heart, Calendar, DollarSign, Pill, Users, Apple, Dumbbell, Shield, FileText, Microscope, Zap, Briefcase } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "../sidebar";

export function ThreadListSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  // Mock thread data with dates for categorization and icons
  const threads = [
    { id: '1', title: 'Cancer Support Questions', lastOpened: new Date('2024-01-15'), lastMessage: 'How can I find a counselor?', icon: Heart },
    { id: '2', title: 'Treatment Information', lastOpened: new Date('2024-01-14'), lastMessage: 'What resources are available?', icon: FileText },
    { id: '3', title: 'Support Group Inquiry', lastOpened: new Date('2024-01-13'), lastMessage: 'Are there online groups?', icon: Users },
    { id: '4', title: 'Financial Assistance', lastOpened: new Date('2024-01-12'), lastMessage: 'Help with treatment costs', icon: DollarSign },
    { id: '5', title: 'Appointment Scheduling', lastOpened: new Date('2024-01-10'), lastMessage: 'How to book sessions?', icon: Calendar },
    { id: '6', title: 'Medication Questions', lastOpened: new Date('2024-01-08'), lastMessage: 'Side effects discussion', icon: Pill },
    { id: '7', title: 'Family Support Resources', lastOpened: new Date('2024-01-05'), lastMessage: 'Resources for caregivers', icon: Users },
    { id: '8', title: 'Mental Health Support', lastOpened: new Date('2024-01-03'), lastMessage: 'Coping with diagnosis', icon: Heart },
    { id: '9', title: 'Nutrition Guidance', lastOpened: new Date('2024-01-01'), lastMessage: 'Diet during treatment', icon: Apple },
    { id: '10', title: 'Exercise Recommendations', lastOpened: new Date('2023-12-28'), lastMessage: 'Safe physical activity', icon: Dumbbell },
    { id: '11', title: 'Insurance Questions', lastOpened: new Date('2023-12-25'), lastMessage: 'Coverage for treatment', icon: Shield },
    { id: '12', title: 'Second Opinion Process', lastOpened: new Date('2023-12-20'), lastMessage: 'Getting another opinion', icon: FileText },
    { id: '13', title: 'Clinical Trials Info', lastOpened: new Date('2023-12-15'), lastMessage: 'Available trials', icon: Microscope },
    { id: '14', title: 'Pain Management', lastOpened: new Date('2023-12-10'), lastMessage: 'Managing treatment pain', icon: Zap },
    { id: '15', title: 'Workplace Accommodations', lastOpened: new Date('2023-12-05'), lastMessage: 'Work during treatment', icon: Briefcase },
    { id: '16', title: 'Travel for Treatment', lastOpened: new Date('2023-11-30'), lastMessage: 'Travel assistance', icon: Calendar },
    { id: '17', title: 'Alternative Therapies', lastOpened: new Date('2023-11-25'), lastMessage: 'Complementary treatments', icon: Heart },
    { id: '18', title: 'End-of-Life Planning', lastOpened: new Date('2023-11-20'), lastMessage: 'Advance directives', icon: FileText },
    { id: '19', title: 'Grief Counseling', lastOpened: new Date('2023-11-15'), lastMessage: 'Support after loss', icon: Heart },
    { id: '20', title: 'Survivorship Care', lastOpened: new Date('2023-11-10'), lastMessage: 'Life after treatment', icon: Heart },
  ];

  return (
    <Sidebar {...props} className="border-r border-primary/20 relative overflow-hidden" collapsible="icon">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 z-0"></div>
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
      
      <SidebarContent 
        className="relative z-10 px-3 py-4 group-data-[collapsible=icon]:cursor-pointer" 
        onClick={() => {
          // Only expand if currently collapsed
          const sidebarGroup = document.querySelector('[data-slot="sidebar"]');
          const isCollapsed = sidebarGroup?.getAttribute('data-state') === 'collapsed';
          if (isCollapsed) {
            toggleSidebar();
          }
        }}
      >
        {/* Main Navigation */}
        <div className="space-y-1 mb-8">
          <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2" title="New chat">
            <Plus className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-foreground group-data-[collapsible=icon]:hidden">New chat</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2" title="Archived">
            <Archive className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-foreground group-data-[collapsible=icon]:hidden">Archived</span>
          </div>
        </div>

        {/* Chats Section */}
        <div className="mb-6">
          {/* Search Input */}
          <div className="mb-3">
            <div className="relative group-data-[collapsible=icon]:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-10 pr-3 py-2 text-sm bg-primary/5 border border-primary/20 rounded-lg focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {/* Search Icon for collapsed state */}
            <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all flex items-center justify-center group-data-[collapsible=icon]:flex hidden" title="Search chats">
              <Search className="h-4 w-4 text-primary flex-shrink-0" />
            </div>
          </div>
          
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-3 group-data-[collapsible=icon]:hidden">
            Chats
          </h3>
          <div className="space-y-1">
            {threads.slice(0, 15).map((thread) => (
              <div
                key={thread.id}
                className="px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-all group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center flex items-center"
                title={thread.title}
              >
                <span className="text-sm text-foreground truncate block group-data-[collapsible=icon]:hidden">
                  {thread.title}
                </span>
              </div>
            ))}
          </div>
        </div>

      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
