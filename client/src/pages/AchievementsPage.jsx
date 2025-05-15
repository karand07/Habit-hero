import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { getAllAchievements, getMyAchievements } from '../services/api';
import { CheckBadgeIcon, LockClosedIcon, ListBulletIcon, EyeIcon, EyeSlashIcon, ShareIcon as ShareIconOutline, ArrowPathIcon } from '@heroicons/react/24/outline'; // Example icons
import ShareModal from '../components/ShareModal'; // Import the new modal

// Placeholder for a dedicated AchievementCard component (to be created)
const AchievementCard = ({ achievement, isUnlocked, unlockedDate, onShare }) => {
  return (
    <div className={`bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6 flex flex-col text-center ${!isUnlocked ? 'opacity-60 dark:opacity-70' : ''}`}>
      <div className="flex-grow">
        {isUnlocked ? 
          <CheckBadgeIcon className="h-16 w-16 text-green-500 dark:text-green-400 mb-3 mx-auto" /> : 
          <LockClosedIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-3 mx-auto" />
        }
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{achievement.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{achievement.description}</p>
        {achievement.criteria && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2"><i>Criteria: {achievement.criteria}</i></p>}
      </div>
      <div className="mt-auto pt-3">
        {isUnlocked && unlockedDate && (
          <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">Unlocked: {new Date(unlockedDate).toLocaleDateString()}</p>
        )}
        {!isUnlocked && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Locked</p>}
        {isUnlocked && (
          <button 
            onClick={() => onShare(achievement)}
            className="mt-2 inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-200 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-800"
          >
            <ShareIconOutline className="h-4 w-4 mr-1.5" />
            Share
          </button>
        )}
      </div>
    </div>
  );
};

export default function AchievementsPage() {
  const [allAchievements, setAllAchievements] = useState([]);
  // Store myUnlockedAchievements as a Map for easier lookup of unlocked_at date
  const [myUnlockedAchievementsMap, setMyUnlockedAchievementsMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState('all');
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedAchievementToShare, setSelectedAchievementToShare] = useState(null);

  const handleOpenShareModal = (achievement) => {
    setSelectedAchievementToShare(achievement);
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setSelectedAchievementToShare(null);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allAchData, myAchData] = await Promise.all([
        getAllAchievements(),
        getMyAchievements(),
      ]);
      setAllAchievements(allAchData || []);
      // Create a Map from achievement ID to its unlocked_at date
      const unlockedMap = new Map();
      (myAchData || []).forEach(ach => unlockedMap.set(ach.id, ach.unlocked_at));
      setMyUnlockedAchievementsMap(unlockedMap);
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
      setError(err.message || 'Failed to load achievements data.');
      toast.error(err.message || 'Failed to load achievements data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const achievementsToDisplay = showFilter === 'unlocked'
    ? allAchievements.filter(ach => myUnlockedAchievementsMap.has(ach.id)) // Check against Map keys
    : allAchievements;

  if (isLoading) {
    return <div className="text-center py-10 dark:text-gray-300">Loading achievements...</div>;
  }

  if (error && achievementsToDisplay.length === 0) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>My Achievements - HabitHero</title>
      </Helmet>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto dark:bg-secondary-900 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Achievements</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowFilter('all')} 
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${showFilter === 'all' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600'}`}
            >
              <ListBulletIcon className={`h-5 w-5 mr-2 ${showFilter === 'all' ? 'text-white dark:text-primary-100' : 'text-gray-500 dark:text-secondary-300'}`} />
              All
            </button>
            <button 
              onClick={() => setShowFilter('unlocked')} 
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${showFilter === 'unlocked' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600'}`}
            >
              <CheckBadgeIcon className={`h-5 w-5 mr-2 ${showFilter === 'unlocked' ? 'text-white dark:text-primary-100' : 'text-green-400 dark:text-green-300'}`} />
              Unlocked
            </button>
            <button
              onClick={fetchData}
              className="ml-2 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600 flex items-center"
              title="Refresh Achievements"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {achievementsToDisplay.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white dark:bg-secondary-800 shadow rounded-md">
            <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              {showFilter === 'unlocked' ? 'No Achievements Unlocked Yet' : 'No Achievements Available'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {showFilter === 'unlocked' ? 'Keep logging your habits to unlock them!' : 'Achievements will appear here once configured.'}
            </p>
          </div>
        )}

        {achievementsToDisplay.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {achievementsToDisplay.map(ach => {
              const isUnlocked = myUnlockedAchievementsMap.has(ach.id);
              const unlockedDate = isUnlocked ? myUnlockedAchievementsMap.get(ach.id) : null;
              return (
                <AchievementCard 
                  key={ach.id} 
                  achievement={ach} 
                  isUnlocked={isUnlocked}
                  unlockedDate={unlockedDate}
                  onShare={handleOpenShareModal}
                />
              );
            })}
          </div>
        )}
      </div>
      {selectedAchievementToShare && (
        <ShareModal 
          isOpen={isShareModalOpen}
          onClose={handleCloseShareModal}
          modalTitle="Share Your Achievement!"
          itemName={selectedAchievementToShare.title}
          itemValue={selectedAchievementToShare.description}
          shareType="achievement"
        />
      )}
    </>
  );
} 