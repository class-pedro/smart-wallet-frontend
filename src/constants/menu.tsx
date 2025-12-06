import { CircleGauge, type LucideIcon } from 'lucide-react';

export type MenuProps = {
  icon: LucideIcon;
  title: string;
  path: string;
};

export const menuOptions: MenuProps[] = [
  {
    icon: CircleGauge,
    title: 'Dashboard',
    path: '/',
  },
];
