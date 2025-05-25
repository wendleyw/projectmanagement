import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'indigo' | 'teal';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 shadow-blue-100',
    green: 'bg-emerald-100 text-emerald-600 shadow-emerald-100',
    red: 'bg-red-100 text-red-600 shadow-red-100',
    yellow: 'bg-amber-100 text-amber-600 shadow-amber-100',
    indigo: 'bg-indigo-100 text-indigo-600 shadow-indigo-100',
    teal: 'bg-teal-100 text-teal-600 shadow-teal-100',
  };

  const trendClasses = {
    positive: 'text-emerald-600 bg-emerald-50 border border-emerald-200',
    negative: 'text-red-600 bg-red-50 border border-red-200',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          {trend && (
            <p className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center ${trend.value >= 0 ? trendClasses.positive : trendClasses.negative}`}>
              {trend.value >= 0 ? (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-full ${colorClasses[color]} shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;