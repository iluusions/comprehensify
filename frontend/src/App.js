import React, { useState, useEffect } from 'react';
import './App.css';
import DescriptionList from './DescriptionList';
import LevelDisplay from './LevelDisplay';

function App() {
  const [userID, setUserID] = useState(null); // Updated to null initially
  const [curTopic, setCurTopic] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [pageContent, setPageContent] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [activeTabUrl, setActiveTabUrl] = useState('');
  const [model, setModel] = useState(null);
  const [cacheChecked, setCacheChecked] = useState(false);

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
          setCurTopic(cachedData.data.getDescriptions.curTopic); // Set curTopic from cache
          setCurrentLevel(cachedData.data.getDescriptions.currentLevel);
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
          setCurTopic(null); // Reset curTopic when there's no cache
        }

        if (result.model) {
          setModel(result.model);
        } else {
          setModel('4o-mini');
        }
        setCacheChecked(true);
      });
    }

    // Ensure this runs once when the component mounts
    if (userID) {
      getTextFromCurrentTab();
    }
  }, [userID]);

  const handleModelChange = (e) => {
    const selectedModel = e.target.value;
    setModel(selectedModel);
    chrome.storage.local.set({ 'model': selectedModel });
  };

  
  return !cacheChecked ? <></> :
  (
    <div className="box">
      <div className="header">
        <div className="title">{curTopic || "comprehensify"}</div>
        <div className='controlsnmodel'>
          <div className="controls">
            <button className="button" disabled={currentLevel === 0} onClick={() => setCurrentLevel(prev => Math.max(prev - 1, 0))}>-</button>
            <LevelDisplay
              userID={userID}
              curTopic={curTopic}
              currentLevel={currentLevel}
              activeTabUrl={activeTabUrl}
            />
            <button className="button" disabled={currentLevel === 9} onClick={() => setCurrentLevel(prev => Math.min(prev + 1, 9))}>+</button>
          </div>
          <div className="model-selector">
            <label htmlFor="model">Model:</label>
            <select id="model" value={model} onChange={handleModelChange}>
              <option value="4o-mini">GPT-4o-Mini</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="claude">Claude</option>
              <option value="llama">LLaMA</option>
            </select>
          </div>
        </div>
      </div>
      <div className="content">
        {model && (
          <DescriptionList
            userID={userID}
            curTopic={curTopic}
            setCurTopic={setCurTopic} // Pass setCurTopic to DescriptionList
            pageContent={pageContent}
            initialData={initialData}
            setInitialData={setInitialData}
            activeTabUrl={activeTabUrl}
            currentLevel={currentLevel}
            setCurrentLevel={setCurrentLevel}
            model={model}
          />
        )}
      </div>
    </div>
  );
}

export default App;
