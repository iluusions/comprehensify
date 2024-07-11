import { useQuery } from '@apollo/client';
import { GET_DESCRIPTIONS } from './queries';

const useDescriptionData = (userID, curTopic, pageContent, initialData, setInitialData, activeTabUrl, model, setCurTopic) => {
  const skipQuery = !!initialData || !initialData && !(pageContent.length); // Skip the query if initialData is available

  const { loading, error, data } = useQuery(GET_DESCRIPTIONS, {
    variables: { userID, curTopic, pageContent, model },
    skip: skipQuery, // Conditionally skip the query
    onCompleted: (fetchedData) => {
      // Update cache with new data
      chrome.storage.local.get([activeTabUrl], (result) => {
        const cachedData = result[activeTabUrl] || {};
        cachedData.pageContent = pageContent;
        cachedData.data = fetchedData;
        chrome.storage.local.set({ [activeTabUrl]: cachedData });
      });
      setInitialData(fetchedData);
      setCurTopic(fetchedData.getDescriptions.curTopic); // Update curTopic in the parent component
    }
  });

  return { loading: skipQuery ? false : loading, error, data: skipQuery ? initialData : data };
};

export default useDescriptionData;
