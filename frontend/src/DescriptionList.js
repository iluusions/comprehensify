import React from 'react';
import useDescriptionData from './useDescriptionData';

const DescriptionList = ({ userID, curTopic, pageContent, initialData, activeTabUrl, currentLevel, model }) => {
  const { loading, error, data } = useDescriptionData(userID, curTopic, pageContent, initialData, activeTabUrl, model);

  if (loading) return <div>Loading...</div>;
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
