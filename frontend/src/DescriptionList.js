import React from 'react';
import useDescriptionData from './useDescriptionData';

const DescriptionList = ({ userID, curTopic, pageContent }) => {
  const { loading, error, data } = useDescriptionData(userID, curTopic, pageContent);

  if (loading || error) return null;

  return data;
};

export default DescriptionList;
