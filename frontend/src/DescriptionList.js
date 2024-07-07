import React from 'react';
import useDescriptionData from './useDescriptionData';

const DescriptionList = ({ userID, curTopic }) => {
  const { loading, error, data } = useDescriptionData(userID, curTopic);

  if (!loading && !error) return data;
};

export default DescriptionList;
