import React, { useState, useEffect } from 'react';
import './App.css';
import DescriptionList from './DescriptionList';

function App() {
  const [userID, setUserID] = useState(null); // Updated to null initially
  const [curTopic, setCurTopic] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [pageContent, setPageContent] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [activeTabUrl, setActiveTabUrl] = useState('');
  const [model, setModel] = useState(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        const token = await new Promise((resolve, reject) => {
          chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError || !token) {
              reject(new Error('Failed to get auth token'));
              return;
            }
            resolve(token);
          });
        });

        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => response.json());

        setUserID(userInfo.email); // Use email as userID
      } catch (error) {
        console.error('Authentication failed', error);
      }
    }

    handleAuth();
  }, []);


  useEffect(() => {
    async function getTextFromCurrentTab() {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      const activeTabId = activeTab.id;
      setActiveTabUrl(activeTab.url);

      chrome.storage.local.get([activeTab.url, 'model'], async (result) => {
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

        if (result.model) {
          setModel(result.model);
        } else {
          setModel('gpt-4o');
        }
      });
    }

    // Ensure this runs once when the component mounts
    if (userID) {
      getTextFromCurrentTab();
    }
  }, [userID, curTopic]);

  const handleModelChange = (e) => {
    const selectedModel = e.target.value;
    setModel(selectedModel);
    chrome.storage.local.set({ 'model': selectedModel });
  };

  return (
    <div className="box">
      <div className="header">
        <div className="title">Information</div>
        <div className="controls">
          <button className="button" disabled={currentLevel === 0} onClick={() => setCurrentLevel(prev => Math.max(prev - 1, 0))}>-</button>
          <span id="currentLevel">Level {currentLevel}</span>
          <button className="button" disabled={currentLevel === 9} onClick={() => setCurrentLevel(prev => Math.min(prev + 1, 9))}>+</button>
        </div>
        <div className="model-selector">
          <label htmlFor="model">Model:</label>
          <select id="model" value={model} onChange={handleModelChange}>
            <option value="gpt-4o">GPT-4o</option>
            <option value="claude">Claude</option>
            <option value="llama">LLaMA</option>
          </select>
        </div>
      </div>
      <div className="content">
        {model && (
          <DescriptionList
            userID={userID}
            curTopic={curTopic}
            pageContent={pageContent}
            initialData={initialData}
            activeTabUrl={activeTabUrl}
            currentLevel={currentLevel}
            model={model}
          />
        )}
      </div>
    </div>
  );
}

export default App;
