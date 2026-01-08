import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Users, DollarSign, TrendingUp, Trophy, ShoppingCart } from 'lucide-react';

interface StatsData {
  totalTicketsSold: number;
  totalRevenue: number;
  totalWinnings: number;
  totalUsers: number;
  electronicTicketsSold: number;
  physicalTicketsUsed: number;
}

interface AdminStatsProps {
  stats: StatsData;
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  const statCards = [
    {
      title: 'Tickets vendus',
      value: stats.totalTicketsSold,
      icon: Ticket,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Revenus totaux',
      value: `${stats.totalRevenue.toLocaleString()} FC`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Gains distribués',
      value: `${stats.totalWinnings.toLocaleString()} FC`,
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Tickets électroniques',
      value: stats.electronicTicketsSold,
      icon: ShoppingCart,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Tickets physiques utilisés',
      value: stats.physicalTicketsUsed,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={stat.title}
            className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border ${stat.borderColor}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
