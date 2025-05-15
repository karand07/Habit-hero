import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ShareIcon as HeroShareIcon, LinkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// Placeholder for social media icons if we add them later
// For now, using text buttons or Heroicons

const APP_URL = window.location.origin; // Using window.location.origin for dynamic URL
const BASE_HASHTAGS = ['HabitHero', 'HabitTracking'];

export default function ShareModal({
  isOpen,
  onClose,
  modalTitle = 'Share This!', // Generic title for the modal itself
  itemName, // e.g., Achievement Title or Habit Title
  itemValue, // e.g., "7-Day Streak" or specific achievement description
  shareType, // 'achievement' or 'streak' to customize text
}) {
  if (!isOpen) return null;

  let textToShare = '';
  let specificHashtags = [];

  if (shareType === 'achievement') {
    textToShare = `🎉 I just unlocked the "${itemName}" achievement on HabitHero! ${itemValue}. Join me in building better habits! ${APP_URL}`;
    specificHashtags = ['AchievementUnlocked'];
  } else if (shareType === 'streak') {
    textToShare = `🔥 I'm on a ${itemValue}-day streak for my "${itemName}" habit on HabitHero! Keeping the momentum going. ${APP_URL}`;
    specificHashtags = ['HabitStreak'];
  } else {
    // Default generic share text if type is not specific
    textToShare = `Check out my progress on HabitHero: ${itemName} - ${itemValue}! ${APP_URL}`;
  }

  const allHashtags = [...BASE_HASHTAGS, ...specificHashtags];
  const textWithHashtags = `${textToShare} #${allHashtags.join(' #')}`;
  const encodedText = encodeURIComponent(textWithHashtags);
  const encodedAppUrl = encodeURIComponent(APP_URL);

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My HabitHero Update: ${itemName}`,
          text: textWithHashtags,
          url: APP_URL,
        });
        toast.success('Shared successfully!');
        onClose();
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Error sharing: ' + error.message);
          console.error('Web Share API error:', error);
        }
      }
    } else {
      toast.info('Web Share API not supported on this browser. Try another option!');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(textWithHashtags).then(() => {
      toast.success('Copied to clipboard!');
      onClose();
    }).catch(err => {
      toast.error('Failed to copy: ' + err.message);
      console.error('Clipboard API error:', err);
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-secondary-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-secondary-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-secondary-800"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                    <HeroShareIcon className="h-6 w-6 text-green-600 dark:text-green-300" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      {modalTitle}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {shareType === 'achievement' ? `You unlocked: ` : (shareType === 'streak' ? `Your streak for ` : 'Item: ')}
                        <span className="font-medium text-gray-800 dark:text-gray-100">{itemName}</span>
                        {shareType === 'streak' && itemValue && <span className="font-medium text-gray-800 dark:text-gray-100"> is {itemValue} days!</span>}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 space-y-3">
                  {navigator.share && (
                    <button
                      type="button"
                      onClick={handleWebShare}
                      className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Share via... (Native)
                    </button>
                  )}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedAppUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full justify-center rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 dark:bg-sky-600 dark:hover:bg-sky-500"
                  >
                    Share on Twitter / X
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedAppUrl}&quote=${encodedText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    Share on Facebook
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <LinkIcon className="h-5 w-5 mr-2" /> Copy Link & Text
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 