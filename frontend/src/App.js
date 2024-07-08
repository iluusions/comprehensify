import React, { useState, useEffect } from 'react';
import './App.css';
import DescriptionList from './DescriptionList';

function App() {
  const [userID, setUserID] = useState(1); // Example userID
  const [curTopic, setCurTopic] = useState(null); // Example topic
  const [currentLevel, setCurrentLevel] = useState(0);
  const [pageContent, setPageContent] = useState('');

  useEffect(() => {
    function getTextFromCurrentTab() {
      chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        const activeTab = tabs[0];
        const activeTabId = activeTab.id;

        chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          func: () => {
            return document.title + document.body.innerText.substring(0, 1024);
          },
        }).then(results => {
          setPageContent(results[0].result);
          console.log(`PageContent: ${results[0].result}`);
          // alert(`PageContent: ${results[0].result}`);
        }).catch(error => {
          console.error('Error injecting script:', error.message);
        });
      });
    }

    // Ensure this runs once when the component mounts
    getTextFromCurrentTab();
  }, []);

  console.log(`Page Content: ${pageContent}`);
  const data = DescriptionList({ userID, curTopic, pageContent });

  if (!data) return null; // or a loading state

  const changeLevel = (change) => {
    setCurrentLevel(prevLevel => Math.min(Math.max(prevLevel + change, 0), 9));
  };

  console.log(data.getDescriptions);
  const levelContent = data.getDescriptions.levelContent[currentLevel];

  return (
    <div className="box">
      <div className="header">
        <div className="title">Information</div>
        <div className="controls">
          <button className="button" disabled={currentLevel === 0} onClick={() => changeLevel(-1)}>-</button>
          <span id="currentLevel">Level {currentLevel}</span>
          <button className="button" disabled={currentLevel === 9} onClick={() => changeLevel(1)}>+</button>
        </div>
      </div>
      <div className="content">
        <div id="tldr">{levelContent.tldr}</div>
        <ul id="topics">
          {levelContent.topics.map((topic, index) => (
            <li key={index}>{topic.topic}: {topic.detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
