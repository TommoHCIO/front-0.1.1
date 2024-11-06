import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { Button } from './Button';
import { Incubator } from './Incubator';

const rewards = [
  { action: 'per view', amount: 1 },
  { action: 'per like', amount: 2 },
  { action: 'per comment', amount: 5 },
  { action: 'per repost', amount: 10 },
];

export const Hero = () => {
  return (
    <div className="space-y-8">
      {/* Introduction Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-white relative overflow-hidden border border-white/10">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        />
        
        <div className="relative max-w-4xl mx-auto">
          <motion.div 
            className="flex flex-col items-center text-center gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size="lg" className="mb-4" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Chat to Earn</h1>
              <p className="text-xl text-primary-200 mb-8">The Future of Social Engagement</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {rewards.map(({ action, amount }) => (
                  <motion.div
                    key={action}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-2xl font-bold text-primary-400">{amount} $CTE</div>
                    <div className="text-sm text-secondary-200">{action}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.p 
            className="text-lg md:text-xl text-center text-secondary-200 max-w-2xl mx-auto leading-relaxed mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join our revolutionary platform where social engagement meets blockchain rewards.
          </motion.p>

          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button variant="primary" icon={ArrowRight}>
              Get Started
            </Button>
            <Button variant="ghost">
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Incubator Section */}
      <Incubator />
    </div>
  );
};