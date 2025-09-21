import React from 'react';
import { clsx } from 'clsx';
import { MapPin, Users, Star, Play } from 'lucide-react';
import { CaliforniaButton } from './CaliforniaButton';

interface CountyCardProps {
  county: {
    id: string;
    name: string;
    description: string;
    image: string;
    area: number;
    population: number;
    difficulty: number;
    completed?: boolean;
    featured?: boolean;
  };
  onPlay?: (countyId: string) => void;
  className?: string;
}

export const CountyCard: React.FC<CountyCardProps> = ({
  county,
  onPlay,
  className
}) => {
  const difficultyStars = Array.from({ length: 5 }, (_, i) => i < county.difficulty);

  const formatPopulation = (pop: number): string => {
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)}M`;
    } else if (pop >= 1000) {
      return `${(pop / 1000).toFixed(0)}K`;
    }
    return pop.toString();
  };

  const formatArea = (area: number): string => {
    return `${area.toLocaleString()} sq mi`;
  };

  return (
    <div
      className={clsx(
        'group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-out border border-ca-fog-200',
        'hover:-translate-y-1 hover:border-ca-gold-300',
        county.completed && 'ring-2 ring-ca-gold-300 bg-gradient-to-br from-ca-gold-50 to-white',
        county.featured && 'ring-2 ring-ca-sunset-300 bg-gradient-to-br from-ca-sunset-50 to-white',
        className
      )}
    >
      {/* County Badge */}
      {(county.completed || county.featured) && (
        <div className="absolute top-3 right-3 z-10">
          <div
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-full shadow-md',
              county.completed && 'bg-ca-gold-500 text-white',
              county.featured && 'bg-ca-sunset-500 text-white'
            )}
          >
            <Star className="w-4 h-4" fill="currentColor" />
          </div>
        </div>
      )}

      {/* County Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={county.image}
          alt={`${county.name} County landscape`}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Floating difficulty indicator */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-ca-charcoal-700">
            <span>Difficulty:</span>
            <div className="flex gap-0.5">
              {difficultyStars.map((filled, index) => (
                <Star
                  key={index}
                  className={clsx(
                    'w-3 h-3',
                    filled ? 'text-ca-gold-500 fill-current' : 'text-ca-gray-300'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* County Name */}
        <h3 className="text-xl font-bold text-ca-charcoal-700 mb-2 group-hover:text-ca-sunset-600 transition-colors duration-200">
          {county.name}
        </h3>

        {/* Description */}
        <p className="text-ca-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {county.description}
        </p>

        {/* County Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 text-ca-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{formatArea(county.area)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-ca-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{formatPopulation(county.population)}</span>
          </div>
        </div>

        {/* Action Button */}
        <CaliforniaButton
          variant={county.completed ? 'outline' : 'primary'}
          size="md"
          icon={Play}
          className="w-full"
          onClick={() => onPlay?.(county.id)}
        >
          {county.completed ? 'Play Again' : 'Start Puzzle'}
        </CaliforniaButton>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div
          className={clsx(
            'absolute inset-0 rounded-2xl',
            county.completed && 'shadow-[0_0_30px_rgba(255,215,0,0.2)]',
            county.featured && 'shadow-[0_0_30px_rgba(255,107,53,0.2)]',
            !county.completed && !county.featured && 'shadow-[0_0_30px_rgba(99,102,241,0.15)]'
          )}
        />
      </div>
    </div>
  );
};

export default CountyCard;