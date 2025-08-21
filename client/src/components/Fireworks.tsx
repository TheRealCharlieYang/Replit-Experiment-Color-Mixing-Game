import React, { useEffect, useState } from "react";

interface FireworksProps {
  trigger: boolean;
  onComplete?: () => void;
  isSpecial?: boolean; // For Permanent Rose Easter egg
}

export function Fireworks({ trigger, onComplete, isSpecial = false }: FireworksProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    maxLife: number;
  }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = isSpecial 
      ? ["#E91E63", "#F06292", "#FCE4EC", "#AD1457", "#C2185B"] // Pink theme for Permanent Rose
      : ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3"];

    const newParticles = [];
    const particleCount = isSpecial ? 80 : 60;
    const explosions = isSpecial ? 3 : 2;

    for (let explosion = 0; explosion < explosions; explosion++) {
      const centerX = Math.random() * 80 + 10; // 10-90% of screen width
      const centerY = Math.random() * 60 + 20; // 20-80% of screen height
      
      for (let i = 0; i < particleCount / explosions; i++) {
        const angle = (Math.PI * 2 * i) / (particleCount / explosions);
        const velocity = Math.random() * 8 + 4;
        const life = Math.random() * 60 + 40;
        
        newParticles.push({
          id: explosion * 100 + i,
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: life,
          maxLife: life,
        });
      }
    }

    setParticles(newParticles);

    const animationInterval = setInterval(() => {
      setParticles(prevParticles => {
        const updatedParticles = prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx * 0.5,
            y: particle.y + particle.vy * 0.5,
            vy: particle.vy + 0.3, // gravity
            life: particle.life - 1,
          }))
          .filter(particle => particle.life > 0);

        if (updatedParticles.length === 0) {
          clearInterval(animationInterval);
          onComplete?.();
        }

        return updatedParticles;
      });
    }, 50);

    return () => clearInterval(animationInterval);
  }, [trigger, isSpecial, onComplete]);

  if (!trigger || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            opacity: particle.life / particle.maxLife,
            transform: `scale(${particle.life / particle.maxLife})`,
            boxShadow: `0 0 6px ${particle.color}`,
          }}
        />
      ))}
      {isSpecial && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl font-bold text-pink-500 animate-pulse">
            💖 For Jenny 💖
          </div>
        </div>
      )}
    </div>
  );
}
