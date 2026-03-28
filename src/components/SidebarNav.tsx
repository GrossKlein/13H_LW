import {
  SquaresFour,
  FileText,
  Clock,
  Users,
  Briefcase,
  ShareNetwork,
} from '@phosphor-icons/react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  id: string;
}

interface SidebarNavProps {
  items: NavItem[];
  activeNav: string;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'light' }>> = {
  grid: SquaresFour,
  'file-text': FileText,
  clock: Clock,
  users: Users,
  briefcase: Briefcase,
  'share-2': ShareNetwork,
};

const SidebarNav = ({ items, activeNav }: SidebarNavProps) => {
  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = activeNav === item.id;
        return (
          <a
            key={item.id}
            href={item.href}
            className={`nav-link ${isActive ? 'active' : ''}`}
          >
            {Icon && <Icon size={16} weight={isActive ? 'bold' : 'regular'} />}
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
