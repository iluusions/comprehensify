import React, { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_LEVEL } from './queries';

const LevelDisplay = ({ userID, curTopic, currentLevel, activeTabUrl }) => {
//   console.log(`Inside LevelDisplay: ${userID}'s level in ${curTopic} is now ${currentLevel}`);
  
  const [updateLevel, { loading, error, data }] = useMutation(UPDATE_LEVEL, {
    onCompleted: () => {
        // Update cache with new data
        chrome.storage.local.get([activeTabUrl], (result) => {
          const cachedData = result[activeTabUrl] || {};
          cachedData.data.getDescriptions.currentLevel = currentLevel;
          chrome.storage.local.set({ [activeTabUrl]: cachedData });
        });
      }
  });

  useEffect(() => {
    if (curTopic && userID) {
      updateLevel({ variables: { userID, curTopic, currentLevel } });
    }
  }, [userID, curTopic, currentLevel, updateLevel]);

//   if (loading) return <span id="currentLevel">Updating...</span>;
//   if (error) return <span id="currentLevel">Error updating level</span>;

  return <span id="currentLevel">Level {currentLevel + 1}</span>;
};

export default LevelDisplay;
