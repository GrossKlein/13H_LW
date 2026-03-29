import {
  SquaresFour,
  FileText,
  Clock,
  Users,
  Briefcase,
  ShareNetwork,
  Warning,
  Drop,
} from '@phosphor-icons/react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  id: string;
}

interface HeaderNavProps {
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
  'warning': Warning,
  'drop': Drop,
};

const HeaderNav = ({ items, activeNav }: HeaderNavProps) => {
  return (
    <nav className="flex items-center gap-1">
      {items.map((item, index) => {
        const Icon = iconMap[item.icon];
        const isActive = activeNav === item.id;
        // Insert separator before "Evidence" group
        const showSeparator = item.id === 'harassment';
        return (
          <>
            {showSeparator && (
              <span key="sep" className="mx-2 h-4 w-px bg-war-border-hi inline-block" />
            )}
            <a
              key={item.id}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              {Icon && <Icon size={14} weight={isActive ? 'bold' : 'regular'} />}
              <span>{item.label}</span>
            </a>
          </>
        );
      })}
    </nav>
  );
};

export default HeaderNav;
