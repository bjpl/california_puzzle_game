import React from 'react';
import { CaliforniaRegion, RegionSelectorProps } from '@/types';
import { REGION_INFO } from '@/utils/californiaData';

const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onRegionChange,
  disabled = false
}) => {
  const regions = Object.values(CaliforniaRegion);

  const getRegionIcon = (region: CaliforniaRegion): string => {
    const icons = {
      [CaliforniaRegion.ALL]: '🗺️',
      [CaliforniaRegion.BAY_AREA]: '🌉',
      [CaliforniaRegion.SOUTHERN]: '🏖️',
      [CaliforniaRegion.NORTHERN]: '🏔️',
      [CaliforniaRegion.CENTRAL]: '🌾',
      [CaliforniaRegion.CENTRAL_VALLEY]: '🚜',
      [CaliforniaRegion.COASTAL]: '🌊',
      [CaliforniaRegion.INLAND]: '🏜️'
    };
    return icons[region] || '📍';
  };

  const getDifficultyBadgeColor = (region: CaliforniaRegion): string => {
    const difficulty = REGION_INFO[region].difficulty;
    const colors = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#f97316',
      expert: '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  return (
    <div className="region-selector">
      {/* Header */}
      <div className="selector-header" style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
          Select Region
        </h3>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
          Choose a California region to practice
        </div>
      </div>

      {/* Region grid */}
      <div className="regions-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '8px',
        padding: '12px'
      }}>
        {regions.map((region) => {
          const regionInfo = REGION_INFO[region];
          const isSelected = selectedRegion === region;

          return (
            <button
              key={region}
              className={`region-option ${isSelected ? 'selected' : ''}`}
              disabled={disabled}
              onClick={() => onRegionChange(region)}
              style={{
                position: 'relative',
                padding: '12px',
                border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                opacity: disabled ? 0.5 : 1,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(59, 130, 246, 0.15)'
                  : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isSelected) {
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isSelected) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}
            >
              {/* Region icon and name */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span style={{ fontSize: '18px' }}>
                  {getRegionIcon(region)}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isSelected ? '#1e40af' : '#374151'
                }}>
                  {regionInfo.name}
                </span>
              </div>

              {/* Description */}
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '8px',
                lineHeight: '1.4'
              }}>
                {regionInfo.description}
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* County count */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#6b7280'
                }}>
                  <span>📊</span>
                  <span>{regionInfo.countyCount} counties</span>
                </div>

                {/* Difficulty badge */}
                <div style={{
                  padding: '2px 6px',
                  borderRadius: '12px',
                  backgroundColor: getDifficultyBadgeColor(region),
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {regionInfo.difficulty}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px'
                }}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="region-stats" style={{
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        fontSize: '11px',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Current: {REGION_INFO[selectedRegion].name}</span>
          <span>{REGION_INFO[selectedRegion].countyCount} counties</span>
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;