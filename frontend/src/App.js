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
  const [model, setModel] = useState(null); // Default model is null initially

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

        // Set the model from storage if it exists, otherwise default to GPT-4o
        if (result.model) {
          setModel(result.model);
        } else {
          setModel('gpt-4o');
        }
      });
    }

    // Ensure this runs once when the component mounts
    getTextFromCurrentTab();
  }, [userID, curTopic]);

  const handleModelChange = (e) => {
    const selectedModel = e.target.value;
    setModel(selectedModel);
    // Save the selected model to chrome.storage.local
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
