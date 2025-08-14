import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACTIVITIES } from '../graphql/queries';
import { ActivityRanking as ActivityRankingType, CitySuggestion } from '../types';

interface ActivityRankingProps {
  city: CitySuggestion;
  weatherLoaded: boolean; // New prop to check if weather is loaded
}

export const ActivityRanking: React.FC<ActivityRankingProps> = ({ city, weatherLoaded }) => {
  const { data, loading, error } = useQuery(GET_ACTIVITIES, {
    variables: { cityId: city.id },
    skip: !city.id || !weatherLoaded, // Skip if weather hasn't loaded yet
  });

  // Don't render anything until weather is loaded
  if (!weatherLoaded) {
    return null;
  }

  if (loading) {
    return (
      <div className="activity-ranking loading">
        <div className="loading-spinner">🏂</div>
        <div>Analyzing activities for {city.name}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-ranking error">
        <div className="error-message">
          Error loading activities: {error.message}
        </div>
      </div>
    );
  }

  if (!data?.activities) {
    return null;
  }

  const activities = data.activities as ActivityRankingType[];

  // Sort activities by score (highest first)
  const sortedActivities = [...activities].sort((a, b) => b.score - a.score);

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'score-high'; // Green
    if (score >= 4) return 'score-medium'; // Yellow/Orange
    return 'score-low'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return 'Excellent';
    if (score >= 4) return 'Good';
    if (score >= 1) return 'Poor';
    return 'Not Recommended';
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'Skiing':
        return '⛷️';
      case 'Surfing':
        return '🏄';
      case 'OutdoorSightseeing':
        return '🏞️';
      case 'IndoorSightseeing':
        return '🏛️';
      default:
        return '🎯';
    }
  };

  const getRankBadge = (index: number) => {
    const badges = ['🥇', '🥈', '🥉', '4️⃣'];
    return badges[index] || `${index + 1}️⃣`;
  };

  const getRecommendationText = (activity: string, score: number) => {
    if (score >= 7) {
      return `Excellent conditions for ${activity.toLowerCase()}!`;
    } else if (score >= 4) {
      return `Good conditions for ${activity.toLowerCase()}.`;
    } else if (score >= 1) {
      return `Poor conditions for ${activity.toLowerCase()}.`;
    } else {
      return `Not recommended for ${activity.toLowerCase()}.`;
    }
  };

  return (
    <div className="activity-ranking">
      <h2>Activity Recommendations for {city.name}</h2>
      <p className="recommendation-subtitle">
        Based on 7-day weather forecast analysis
      </p>
      
      <div className="activities-list">
        {sortedActivities.map((activity, index) => (
          <div key={activity.activity} className="activity-card">
            <div className="activity-header">
              <div className="rank-badge">{getRankBadge(index)}</div>
              <div className="activity-icon">{getActivityIcon(activity.activity)}</div>
              <div className="activity-name">{activity.activity}</div>
            </div>
            
            <div className="activity-score-section">
              <div className="score-display">
                <div className={`score ${getScoreColor(activity.score)}`}>
                  {activity.score}/10
                </div>
                <div className="score-label">{getScoreLabel(activity.score)}</div>
              </div>
              <div className="recommendation-text">
                {getRecommendationText(activity.activity, activity.score)}
              </div>
            </div>
            
            <div className="activity-details">
              <div className="detail-title">Weather Analysis:</div>
              <div className="detail-content">{activity.reason}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="score-legend">
        <div className="legend-title">Score Guide:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color score-high"></span>
            <span>Excellent (7-10)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color score-medium"></span>
            <span>Good (4-6)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color score-low"></span>
            <span>Poor (1-3)</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 