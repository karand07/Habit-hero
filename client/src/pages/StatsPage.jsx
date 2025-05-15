import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { getStatsSummary, getActivityTimeline } from '../services/api';
import {
  ChartBarIcon, HashtagIcon, FireIcon, SparklesIcon, 
  CheckCircleIcon, UsersIcon, ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, icon: Icon, unit = '' }) => {
  return (
    <div className="bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-primary-500 dark:bg-primary-600 rounded-md p-3">
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
              {value} {unit}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default function StatsPage() {
  const [summaryStats, setSummaryStats] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, timelineData] = await Promise.all([
        getStatsSummary(),
        getActivityTimeline(30) 
      ]);
      setSummaryStats(summaryData);
      setActivityData(timelineData);
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
      setError(err.message || 'Failed to load statistics.');
      toast.error(err.message || 'Failed to load statistics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const activityChartData = activityData ? {
    labels: activityData.map(d => new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Completions',
        data: activityData.map(d => d.completions),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const activityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#4b5563',
        }
      },
      title: {
        display: true,
        text: 'Daily Habit Completions (Last 30 Days)',
        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          stepSize: 1 
        }
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading statistics...</div>;
  }

  if (error || !summaryStats) {
    return <div className="text-center py-10 text-red-500">Error: {error || 'Could not load statistics summary.'}</div>;
  }

  return (
    <>
      <Helmet>
        <title>My Statistics - HabitHero</title>
      </Helmet>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Statistics Summary</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard title="Total Habits" value={summaryStats.totalHabits} icon={HashtagIcon} />
          <StatCard title="Total Completions" value={summaryStats.totalCompletions} icon={SparklesIcon} />
          <StatCard title="Longest Overall Streak" value={summaryStats.longestOverallStreak} icon={FireIcon} unit="days" />
          <StatCard title="Habits Completed Today" value={summaryStats.habitsCompletedTodayCount} icon={CheckCircleIcon} />
          <StatCard title="Overall Engagement" value={summaryStats.overallEngagementPercentage} icon={UsersIcon} unit="%" />
          <StatCard title="Average Current Streak" value={summaryStats.averageCurrentStreak} icon={ArrowTrendingUpIcon} unit="days" />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Timeline</h2>
          {activityChartData ? (
            <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 h-96">
              <Bar options={activityChartOptions} data={activityChartData} />
            </div>
          ) : (
            !isLoading && (
              <div className="bg-white shadow-lg rounded-lg p-6 text-center text-gray-500">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                Could not load activity data.
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
} 