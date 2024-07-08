import { useQuery } from '@apollo/client';
import { GET_DESCRIPTIONS } from './queries';

const useDescriptionData = (userID, curTopic, pageContent) => {
  const { loading, error, data } = useQuery(GET_DESCRIPTIONS, {
    variables: { userID, curTopic, pageContent },
  });

  return { loading, error, data };
};

export default useDescriptionData;
