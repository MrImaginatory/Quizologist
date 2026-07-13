"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Users } from "lucide-react";
import { AppLogo } from "@/components/app-logo";

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Quiz Library",
    description: "Access thousands of questions across multiple subjects",
  },
  {
    icon: CheckCircle,
    title: "Instant Results",
    description: "Get immediate feedback on your performance",
  },
  {
    icon: Users,
    title: "Learn Together",
    description: "Join a community of learners and educators",
  },
];

export function AuthBranding() {
  return (
    <div className="flex flex-col justify-center items-center p-12 h-full bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-6">
          <AppLogo size="lg" showName={false} />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Welcome to {process.env.NEXT_PUBLIC_APP_NAME || "Quiz App"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-sm">
          Master any subject with our interactive quiz platform
        </p>
      </motion.div>

      <div className="space-y-6 max-w-sm">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-center text-sm text-muted-foreground"
      >
        Trusted by 10,000+ students and educators
      </motion.div>
    </div>
  );
}
