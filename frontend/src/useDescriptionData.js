import { useQuery } from '@apollo/client';
import { GET_DESCRIPTIONS } from './queries';

const useDescriptionData = (userID, curTopic) => {
  const { loading, error, data } = useQuery(GET_DESCRIPTIONS, {
    variables: { userID, curTopic },
  });

  return { loading, error, data };
};

export default useDescriptionData;
