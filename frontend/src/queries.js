import { gql } from '@apollo/client';

export const GET_DESCRIPTIONS = gql`
  query GetDescriptions($userID: Int!, $curTopic: String, $pageContent: String, $model: String!) {
    getDescriptions(userID: $userID, curTopic: $curTopic, pageContent: $pageContent, model: $model) {
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
