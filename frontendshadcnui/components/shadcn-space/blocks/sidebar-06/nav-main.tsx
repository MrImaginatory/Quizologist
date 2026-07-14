"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

export type NavItem = {
  label?: string;
  isSection?: boolean;
  title?: string;
  icon?: LucideIcon;
  href?: string;
  children?: NavItem[];
};

function findActiveParent(items: NavItem[], pathname: string): string | null {
  // First check for exact match
  for (const item of items) {
    if (item.href && pathname === item.href) {
      return item.title || null;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.href && pathname === child.href) {
          return item.title || null;
        }
      }
    }
  }

  // Then check for prefix match (but not just "/dashboard" matching "/dashboard/enrollments")
  for (const item of items) {
    if (item.href && item.href !== "/dashboard" && pathname.startsWith(item.href)) {
      return item.title || null;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.href && child.href !== "/dashboard" && pathname.startsWith(child.href)) {
          return item.title || null;
        }
      }
    }
  }

  // For dashboard specifically, only match exact path
  if (pathname === "/dashboard") {
    return "Dashboard";
  }

  return items.find((i) => !i.isSection)?.title || null;
}

function findActiveChild(items: NavItem[], pathname: string): string | null {
  for (const item of items) {
    if (item.children) {
      for (const child of item.children) {
        if (child.href && pathname === child.href) {
          return child.title || null;
        }
      }
    }
  }
  return null;
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [activeParent, setActiveParent] = React.useState<string | null>(() =>
    findActiveParent(items, pathname)
  );
  const [activeChild, setActiveChild] = React.useState<string | null>(() =>
    findActiveChild(items, pathname)
  );

  React.useEffect(() => {
    setActiveParent(findActiveParent(items, pathname));
    setActiveChild(findActiveChild(items, pathname));
  }, [pathname, items]);

  return (
    <>
      {items.map((item, index) => (
        <NavMainItem
          key={item.title || item.label || index}
          item={item}
          activeParent={activeParent}
          setActiveParent={setActiveParent}
          activeChild={activeChild}
          setActiveChild={setActiveChild}
        />
      ))}
    </>
  );
}

function NavMainItem({
  item,
  activeParent,
  setActiveParent,
  activeChild,
  setActiveChild,
}: {
  item: NavItem;
  activeParent: string | null;
  activeChild: string | null;
  setActiveParent: (val: string) => void;
  setActiveChild: (val: string | null) => void;
}) {
  const hasChildren = !!item.children?.length;
  const isParentActive = activeParent === item.title;
  const [isOpen, setIsOpen] = React.useState(isParentActive);

  // Sync open state when activeParent changes
  React.useEffect(() => {
    if (isParentActive) {
      setIsOpen(true);
    }
  }, [isParentActive]);

  // Section label
  if (item.isSection && item.label) {
    return (
      <SidebarGroup className="p-0 pt-5 first:pt-0">
        <SidebarGroupLabel className="p-0 text-xs font-medium uppercase text-sidebar-foreground">
          {item.label}
        </SidebarGroupLabel>
      </SidebarGroup>
    );
  }

  // Item with children → collapsible
  if (hasChildren && item.title) {
    return (
      <SidebarGroup className="p-0">
        <SidebarMenu>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuItem>
              <CollapsibleTrigger
                className="w-full"
                render={
                  <SidebarMenuButton
                    id={`nav-main-trigger-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    tooltip={item.title}
                    isActive={isParentActive}
                    onClick={() => setActiveParent(item.title!)}
                    className={cn(
                      "rounded-md text-sm font-medium px-3 py-2 h-9 transition-colors cursor-pointer",
                      isParentActive ? "bg-primary! text-primary-foreground!" : ""
                    )}
                  >
                    {item.icon && <item.icon size={16} />}
                    <span>{item.title}</span>
                    <ChevronRight
                      className={cn(
                        "ml-auto transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </SidebarMenuButton>
                }
              />
              <CollapsibleContent>
                <SidebarMenuSub className="me-0 pe-0">
                  {item.children!.map((child, index) => (
                    <NavMainSubItem
                      key={child.title || index}
                      item={child}
                      activeParent={activeParent}
                      setActiveParent={setActiveParent}
                      activeChild={activeChild}
                      setActiveChild={setActiveChild}
                      parentTitle={item.title}
                    />
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // Item without children
  if (item.title) {
    return (
      <SidebarGroup className="p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              id={`nav-main-button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
              tooltip={item.title}
              isActive={isParentActive}
              onClick={() => {
                setActiveParent(item.title!);
                setActiveChild(null);
              }}
              className={cn(
                "rounded-md text-sm font-medium px-3 py-2 h-9 transition-colors cursor-pointer",
                isParentActive ? "bg-primary! text-primary-foreground!" : ""
              )}
              render={<Link href={item.href || "#"} />}
            >
              {item.icon && <item.icon />}
              {item.title}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return null;
}

function NavMainSubItem({
  item,
  activeParent,
  setActiveParent,
  activeChild,
  setActiveChild,
  parentTitle,
}: {
  item: NavItem;
  activeParent: string | null;
  activeChild: string | null;
  setActiveParent: (val: string) => void;
  setActiveChild: (val: string | null) => void;
  parentTitle?: string;
}) {
  const hasChildren = !!item.children?.length;
  const [isOpen, setIsOpen] = React.useState(false);

  if (hasChildren && item.title) {
    return (
      <SidebarMenuSubItem>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger
            className="w-full"
            render={
              <SidebarMenuSubButton 
                id={`nav-sub-trigger-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-md text-sm font-medium px-3 py-2 h-9"
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight
                  className={cn(
                    "ml-auto transition-transform duration-200",
                    isOpen && "rotate-90"
                  )}
                />
              </SidebarMenuSubButton>
            }
          />
          <CollapsibleContent>
            <SidebarMenuSub className="me-0 pe-0">
              {item.children!.map((child, index) => (
                <NavMainSubItem
                  key={child.title || index}
                  item={child}
                  activeParent={activeParent}
                  setActiveParent={setActiveParent}
                  activeChild={activeChild}
                  setActiveChild={setActiveChild}
                  parentTitle={parentTitle}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuSubItem>
    );
  }

  if (item.title) {
    return (
      <SidebarMenuSubItem className="w-full">
        <SidebarMenuSubButton
          id={`nav-sub-button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
          className={cn(
            "w-full rounded-md transition-colors",
            activeChild === item.title ? "bg-muted! text-foreground!" : ""
          )}
          isActive={activeChild === item.title}
          onClick={() => {
            setActiveParent(parentTitle || "");
            setActiveChild(item.title!);
          }}
          render={<Link href={item.href || "#"}>{item.title}</Link>}
        />
      </SidebarMenuSubItem>
    );
  }

  return null;
}
