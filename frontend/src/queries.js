import { gql } from '@apollo/client';

export const GET_DESCRIPTIONS = gql`
  query GetDescriptions($userID: Int!, $curTopic: String, $pageContent: String) {
    getDescriptions(userID: $userID, curTopic: $curTopic, pageContent: $pageContent) {
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
