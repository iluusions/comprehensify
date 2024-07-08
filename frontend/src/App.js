import React, { useState, useEffect } from 'react';
import './App.css';
import DescriptionList from './DescriptionList';

function App() {
  const [userID, setUserID] = useState(1); // Example userID
  const [curTopic, setCurTopic] = useState(null); // Example topic
  const [currentLevel, setCurrentLevel] = useState(0);
  const [pageContent, setPageContent] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [activeTabUrl, setActiveTabUrl] = useState('');

  useEffect(() => {
    async function getTextFromCurrentTab() {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      const activeTabId = activeTab.id;
      setActiveTabUrl(activeTab.url);

      chrome.storage.local.get([activeTab.url], async (result) => {
        if (result[activeTab.url]) {
          const cachedData = result[activeTab.url];
          setInitialData(cachedData.data);
          setPageContent(cachedData.pageContent);
          console.log(`Using cached data for URL: ${activeTab.url}`);
        } else {
          const results = await chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: () => {
              const title = document.title;
              const innerText = document.body.innerText || "";
              const outerText = document.body.outerText || "";

              let combinedText = `${title}\n${innerText}\n${outerText}`;
              const maxLength = 2000;
              if (combinedText.length > maxLength) {
                combinedText = `${title}\n${combinedText.substring(title.length + 1, maxLength)}`;
              }
              return combinedText;
            },
          });

          const pageContent2 = results[0].result;
          setPageContent(pageContent2);
          setInitialData(null);
        }
      });
    }

    // Ensure this runs once when the component mounts
    getTextFromCurrentTab();
  }, [userID, curTopic]);

  return (
    <div className="box">
      <div className="header">
        <div className="title">Information</div>
        <div className="controls">
          <button className="button" disabled={currentLevel === 0} onClick={() => setCurrentLevel(prev => Math.max(prev - 1, 0))}>-</button>
          <span id="currentLevel">Level {currentLevel}</span>
          <button className="button" disabled={currentLevel === 9} onClick={() => setCurrentLevel(prev => Math.min(prev + 1, 9))}>+</button>
        </div>
      </div>
      <div className="content">
        <DescriptionList userID={userID} curTopic={curTopic} pageContent={pageContent} initialData={initialData} activeTabUrl={activeTabUrl} currentLevel={currentLevel} />
      </div>
    </div>
  );
}

export default App;
