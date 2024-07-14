import React from 'react';
import useDescriptionData from './useDescriptionData';
import LoadingSpinner from './LoadingSpinner';

const DescriptionList = ({ userID, curTopic, setCurTopic, pageContent, initialData, setInitialData, activeTabUrl, currentLevel, setCurrentLevel, model }) => {
  const { loading, error, data } = useDescriptionData(userID, curTopic, pageContent, initialData, setInitialData, activeTabUrl, model, setCurTopic, setCurrentLevel);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading data</div>;

  if (!data) return null;

  const levelContent = data.getDescriptions.levelContent[currentLevel];

  return (
    <div>
      <div id="tldr">{levelContent.tldr}</div>
      <ul id="topics">
        {levelContent.topics.map((topic, index) => (
          <li key={index}>{topic.topic}: {topic.detail}</li>
        ))}
      </ul>
    </div>
  );
};

export default DescriptionList;
