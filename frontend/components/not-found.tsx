"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center text-center max-w-md"
      >
        <motion.div variants={itemVariants}>
          <AppLogo size="lg" showName={false} />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 text-8xl font-bold text-primary/20 select-none"
        >
          404
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mt-4 text-2xl font-semibold text-foreground"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-3 text-muted-foreground text-center"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <Button size="lg" render={<Link href="/" />}>
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
