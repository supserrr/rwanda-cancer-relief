'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Clock, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingStyleCounselorCardProps {
  id: string;
  name: string;
  avatar?: string;
  specialty?: string;
  availability?: 'available' | 'busy' | 'offline';
  experience?: number;
  onBookSession?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  delay?: number;
  className?: string;
}

export function LandingStyleCounselorCard({
  id,
  name,
  avatar,
  specialty,
  availability,
  experience,
  onBookSession,
  onViewProfile,
  delay = 0,
  className
}: LandingStyleCounselorCardProps) {
  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn('h-full', className)}
    >
      <Card className="relative overflow-hidden h-full bg-background border border-border/50 rounded-xl transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <CardContent className="p-6">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-sm">
                  {name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getAvailabilityColor(availability)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">{name}</h3>
              {specialty && (
                <p className="text-sm text-muted-foreground truncate">{specialty}</p>
              )}
            </div>
          </div>

          {/* Essential Info Only */}
          <div className="space-y-2 mb-4">
            {experience && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{experience} years experience</span>
              </div>
            )}
            
            {availability && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{getAvailabilityText(availability)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {onBookSession && (
              <Button 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => onBookSession(id)}
                disabled={availability === 'offline'}
              >
                Book Session
              </Button>
            )}
            {onViewProfile && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => onViewProfile(id)}
              >
                View Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
