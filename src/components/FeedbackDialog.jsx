import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ThumbsUp, ThumbsDown, Send, XCircle } from 'lucide-react';

// Predefined feedback options
const LIKE_OPTIONS = [
  'Helpful and clear',
  'Comprehensive answer',
  'Exactly what I needed',
  'Well-explained',
  'Others'
];

const DISLIKE_OPTIONS = [
  'Incomplete answer',
  'Incorrect information',
  'Too complex',
  'Not relevant',
  'Others'
];

const FeedbackDialog = ({ isLike = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [customFeedback, setCustomFeedback] = useState('');

  // Determine options based on like/dislike
  const options = isLike ? LIKE_OPTIONS : DISLIKE_OPTIONS;

  const handleSubmit = () => {
    // Collect and process feedback
    const feedbackData = {
      type: isLike ? 'like' : 'dislike',
      option: selectedOption,
      customFeedback: selectedOption === 'Others' ? customFeedback : ''
    };

    // TODO: Implement actual feedback submission logic
    console.log('Feedback submitted:', feedbackData);

    // Reset and close dialog
    setSelectedOption('');
    setCustomFeedback('');
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger button */}
      <Dialog.Trigger 
        className="p-1.5"
        onClick={() => setIsOpen(true)}
      >
        {isLike ? <ThumbsUp size={20} /> : <ThumbsDown size={20} />}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-96 w-full max-w-md overflow-y-auto bg-white dark:bg-gray-700 rounded-lg shadow p-6 z-50"
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold dark:text-white">
              {isLike ? 'What did you like?' : 'What was not helpful?'}
            </Dialog.Title>
            <Dialog.Close 
              className="text-gray-500 hover:text-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white rounded-full p-0.5"
              aria-label="Close"
            >
              <XCircle size={24} />
            </Dialog.Close>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <label 
                key={option} 
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="feedback-option"
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => setSelectedOption(option)}
                  className="text-blue-600 dark:text-blue-500"
                />
                <span className="dark:text-gray-200">{option}</span>
              </label>
            ))}

            {selectedOption === 'Others' && (
              <div className="mt-4 space-y-2">
                <textarea
                  placeholder="Please provide more details..."
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white dark:border-gray-600"
                  rows={1}
                />
              </div>
            )}
            {selectedOption === 'Others' && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                // disabled={!selectedOption || (selectedOption === 'Others' && !customFeedback.trim())}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                <span>Send Feedback</span>
              </button>
            </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FeedbackDialog;