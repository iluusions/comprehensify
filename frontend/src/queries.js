import { gql } from '@apollo/client';

export const GET_DESCRIPTIONS = gql`
  query GetDescriptions($userID: Int!, $curTopic: String!) {
    getDescriptions(userID: $userID, curTopic: $curTopic) {
      currentLevel
      levelContent {
        tldr
        topics {
          topic
          detail
        }
      }
    }
  }
`;
