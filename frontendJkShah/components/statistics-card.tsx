"use client"

import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export function StatisticsCard({ stats }: StatisticsCardProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {stats.map((item, index) => (
        <motion.div key={index} variants={itemVariant}>
          <Card className="p-0 overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-md border-border/60 hover:border-primary/20 h-full">
            <CardContent className="p-6 h-full flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.title}</h5>
                  <div className={`p-3 rounded-2xl ${item.badgeColor || 'bg-primary/10'} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon icon={item.icon} width={22} height={22} className={item.badgeColor ? 'text-foreground' : 'text-primary'} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h5 className="text-3xl font-bold tracking-tight">{item.value}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground font-medium">{item.period}</p>
                  <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/70 transition-colors border-0">
                    <div className="flex items-center gap-1.5 py-0.5">
                      <Icon icon={item.changeIcon} width={14} height={14} className="text-primary" />
                      <span className="font-medium text-xs">{item.change}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
