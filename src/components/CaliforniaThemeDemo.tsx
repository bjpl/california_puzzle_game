import React, { useState } from 'react';
import { CaliforniaButton } from './CaliforniaButton';
import { CountyCard } from './CountyCard';
import { ProgressIndicator } from './ProgressIndicator';
import { AchievementBadge } from './AchievementBadge';
import { Play, MapPin, Settings, Star, Trophy } from 'lucide-react';

// Sample data for demonstration
const sampleCounties = [
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    description: 'The entertainment capital of the world, home to Hollywood and beautiful beaches.',
    image: '/images/counties/los-angeles.jpg',
    area: 4751,
    population: 10014009,
    difficulty: 2,
    completed: true,
    featured: false
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    description: 'Famous for the Golden Gate Bridge, cable cars, and tech innovation.',
    image: '/images/counties/san-francisco.jpg',
    area: 47,
    population: 873965,
    difficulty: 4,
    completed: false,
    featured: true
  },
  {
    id: 'orange',
    name: 'Orange',
    description: 'Known for Disneyland, beautiful beaches, and perfect weather year-round.',
    image: '/images/counties/orange.jpg',
    area: 948,
    population: 3175692,
    difficulty: 3,
    completed: false,
    featured: false
  }
];

const sampleAchievements = [
  {
    id: 'first-county',
    title: 'First Steps',
    description: 'Complete your first California county puzzle.',
    category: 'geography' as const,
    rarity: 'common' as const,
    icon: 'star',
    earned: true,
    earnedDate: new Date('2024-01-15'),
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete a county puzzle in under 30 seconds.',
    category: 'speed' as const,
    rarity: 'rare' as const,
    icon: 'zap',
    earned: false,
    progress: {
      current: 2,
      total: 5
    },
    requirements: [
      'Complete any county in under 30 seconds',
      'Maintain 95% accuracy',
      'No hints used'
    ]
  },
  {
    id: 'california-master',
    title: 'California Master',
    description: 'Complete all 58 California counties with perfect accuracy.',
    category: 'accuracy' as const,
    rarity: 'legendary' as const,
    icon: 'trophy',
    earned: false,
    progress: {
      current: 15,
      total: 58
    }
  }
];

export const CaliforniaThemeDemo: React.FC = () => {
  const [progress, setProgress] = useState(26);

  const handleCountyPlay = (countyId: string) => {
    console.log('Playing county:', countyId);
    // Simulate progress increase
    setProgress(prev => Math.min(prev + 5, 100));
  };

  const handleAchievementClick = (achievement: any) => {
    console.log('Achievement clicked:', achievement.title);
  };

  return (
    <div className="min-h-screen bg-topo-sand p-6">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Section */}
        <header className="text-center py-12">
          <h1 className="text-6xl font-bold mb-4 text-ca-gradient">
            California Counties Puzzle
          </h1>
          <p className="text-xl text-ca-slate-600 mb-8 max-w-2xl mx-auto">
            Explore the Golden State through an interactive puzzle experience featuring
            all 58 California counties with beautiful, accessible design.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <CaliforniaButton variant="primary" size="lg" icon={Play}>
              Start Playing
            </CaliforniaButton>
            <CaliforniaButton variant="outline" size="lg" icon={MapPin}>
              View Map
            </CaliforniaButton>
            <CaliforniaButton variant="ghost" size="lg" icon={Settings}>
              Settings
            </CaliforniaButton>
          </div>
        </header>

        {/* Progress Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-ca-charcoal-700 text-center mb-8">
            Your California Journey
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProgressIndicator
                completionPercentage={progress}
                variant="detailed"
                title="Discovery Progress"
                subtitle="Explore all 58 California counties"
              />
            </div>

            <div className="space-y-4">
              <ProgressIndicator
                completionPercentage={85}
                variant="compact"
                title="Weekly Goal"
                showPercentage={true}
              />
              <ProgressIndicator
                completionPercentage={62}
                variant="compact"
                title="Accuracy Rate"
                showPercentage={true}
              />
              <ProgressIndicator
                completionPercentage={34}
                variant="compact"
                title="Speed Challenges"
                showPercentage={true}
              />
            </div>
          </div>
        </section>

        {/* Counties Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-ca-charcoal-700 text-center mb-8">
            Featured Counties
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleCounties.map((county) => (
              <CountyCard
                key={county.id}
                county={county}
                onPlay={handleCountyPlay}
              />
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-ca-charcoal-700 text-center mb-8">
            Achievements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="md"
                showProgress={true}
                onClick={handleAchievementClick}
              />
            ))}
          </div>
        </section>

        {/* Button Showcase */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-ca-charcoal-700 text-center mb-8">
            California Design System
          </h2>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-ca-charcoal-700 mb-6">Button Variants</h3>

            <div className="space-y-6">
              {/* Primary Buttons */}
              <div>
                <h4 className="text-sm font-medium text-ca-gray-600 mb-3">Primary Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <CaliforniaButton variant="primary" size="sm">Small Primary</CaliforniaButton>
                  <CaliforniaButton variant="primary" size="md">Medium Primary</CaliforniaButton>
                  <CaliforniaButton variant="primary" size="lg">Large Primary</CaliforniaButton>
                  <CaliforniaButton variant="primary" size="xl">Extra Large</CaliforniaButton>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div>
                <h4 className="text-sm font-medium text-ca-gray-600 mb-3">Secondary Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <CaliforniaButton variant="secondary" size="sm" icon={Star}>With Icon</CaliforniaButton>
                  <CaliforniaButton variant="secondary" size="md" isLoading>Loading</CaliforniaButton>
                  <CaliforniaButton variant="secondary" size="lg" icon={Trophy} iconPosition="right">
                    Icon Right
                  </CaliforniaButton>
                </div>
              </div>

              {/* Outline Buttons */}
              <div>
                <h4 className="text-sm font-medium text-ca-gray-600 mb-3">Outline & Ghost Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <CaliforniaButton variant="outline" size="md">Outline Button</CaliforniaButton>
                  <CaliforniaButton variant="ghost" size="md">Ghost Button</CaliforniaButton>
                  <CaliforniaButton variant="outline" size="md" disabled>Disabled</CaliforniaButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette Showcase */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-ca-charcoal-700 mb-6">California Color Palette</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'CA Gold', color: 'bg-ca-gold-500', text: 'text-white' },
              { name: 'CA Sunset', color: 'bg-ca-sunset-500', text: 'text-white' },
              { name: 'CA Ocean', color: 'bg-ca-ocean-500', text: 'text-white' },
              { name: 'CA Redwood', color: 'bg-ca-redwood-500', text: 'text-white' },
              { name: 'CA Poppy', color: 'bg-ca-poppy-500', text: 'text-white' },
              { name: 'CA Tech', color: 'bg-ca-tech-500', text: 'text-white' },
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div className={`${color.color} ${color.text} p-6 rounded-lg mb-2 shadow-md`}>
                  <div className="font-semibold">{color.name}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-ca-fog-200">
          <p className="text-ca-gray-600">
            Designed with love for the Golden State 🌟
          </p>
        </footer>

      </div>
    </div>
  );
};

export default CaliforniaThemeDemo;