import { gql } from '@apollo/client';

export const GET_DESCRIPTIONS = gql`
  query GetDescriptions($userID: String!, $curTopic: String, $pageContent: String, $model: String!) {
    getDescriptions(userID: $userID, curTopic: $curTopic, pageContent: $pageContent, model: $model) {
      currentLevel
      levelContent {
        tldr
        topics {
          topic
          detail
        }
      }
      curTopic
    }
  }
`;

export const UPDATE_LEVEL = gql`
  mutation UpdateLevel($userID: String!, $curTopic: String!, $currentLevel: Int!) {
    updateLevel(userID: $userID, curTopic: $curTopic, currentLevel: $currentLevel)
  }
`;
