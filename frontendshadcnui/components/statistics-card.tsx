"use client"

import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatItem {
  title: string;
  value: string;
  icon: string;
  badgeColor: string;
  change: string;
  changeIcon: string;
  period: string;
}

interface StatisticsCardProps {
  stats: StatItem[];
}

export function StatisticsCard({ stats }: StatisticsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((item, index) => (
        <Card key={index} className="p-0">
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <h5 className="text-base font-medium">{item.title}</h5>
                <div className="p-3 rounded-full outline outline-border text-primary">
                  <Icon icon={item.icon} width={16} height={16} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h5 className="text-2xl font-semibold">{item.value}</h5>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{item.period}</p>
                  <Badge className={`${item.badgeColor} text-muted-foreground`}>
                    <div className="flex items-center gap-1">
                      {item.change}
                      <Icon icon={item.changeIcon} width={14} height={14} />
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
