const { ApolloServer, gql } = require('apollo-server');
const OpenAI = require('openai');
const getUserKnowledge = require('../database/getUserKnowledge'); // Import the getUserKnowledge function

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// GraphQL Schema
const typeDefs = gql`
  type TopicDetail {
    topic: String
    detail: String
  }

  type LevelContent {
    tldr: String
    topics: [TopicDetail]
  }

  type DescriptionData {
    currentLevel: Int
    levelContent: [LevelContent]
  }

  type Query {
    getDescriptions(userID: Int!, curTopic: String!): DescriptionData
  }
`;

// Resolver
const resolvers = {
  Query: {
    getDescriptions: async (_, { userID, curTopic }) => {
      // Log the curTopic and userID
      console.log(`curTopic: ${curTopic}`);
      console.log(`userID: ${userID}`);

      try {
        // Retrieve user knowledge data from DynamoDB
        const genKnowledge = await getUserKnowledge(userID);
        if (!genKnowledge) {
          throw new Error(`User with userID: ${userID} not found`);
        }

        // Construct the prompt for ChatGPT
        const knowledgePairs = Object.entries(genKnowledge).map(([topic, level]) => `${topic}: ${level}`).join(', ');
        const prompt = `
          I have user information regarding their knowledge levels in various topics. The topic-level pairings are as follows: {${knowledgePairs}}. Could you please predict this user’s knowledge level for ${curTopic}? Return that level under the “currentLevel” field of the return object shown below. Also generate the content for each of the levels, under a nested dictionary called levelContent. Within level content, for each of the 10 levels (1-10 as the keys), there will be a summary (key is tldr) corresponding to a string of text as well as list of topics (key is topics). Within the topics list, there will be around 5 dictionaries, and in each dictionary there will be two elements, a topic corresponding to a string (key is topic) as well as details corresponding to another string related to the topic (key is detail). Can you create the data, where level 1 is at the knowledge of a third grader and level 10 is at the knowledge of a PhD grad, for the overall curTopic, making the TLDRs summarize the topic-detail pairs? This should be a JSON object under the name of “data”. Here is a sample where curTopic is quantum computing:
          
          const data = {
            currentLevel: 1,
            levelContent: {
              1: {
                tldr: "Quantum computing is like a super-powered computer that can solve some problems much faster than regular computers.",
                topics: [
                  { topic: "Qubit", detail: "The basic unit of quantum information, like a bit in regular computers but more powerful." },
                  { topic: "Superposition", detail: "A qubit can be both 0 and 1 at the same time, unlike regular bits." },
                  { topic: "Entanglement", detail: "A special connection between qubits that lets them share information instantly." },
                  { topic: "Quantum Gate", detail: "A tool that changes the state of a qubit, like a switch for regular bits." },
                  { topic: "Quantum Speedup", detail: "The ability of quantum computers to solve some problems faster than regular ones." }
                ]
              },
              // Add level 2 to 10 as per the detailed format
            }
          };

          GIVE ME ONLY THE JSON AND NOTHING ELSE.
          GIVE IT IN A FORMAT THAT WILL ALLOW THE NEXT LINE IN MY CODE TO WORK (response is the chatGPT response):
          const chatGPTData = JSON.parse(response.choices[0].message.content.trim());
          GIVE ME THE RESPONSE IN PLAIN TEXT, NO FORMATTING, WITHOUT MARKDOWN
        `;

        // Make a query to ChatGPT
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          max_tokens: 3000,
          temperature: 1,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });

        // console.log(JSON.stringify(response));
        // Parse and format the response correctly
        const chatGPTData = JSON.parse(response.choices[0].message.content.trim());

        // Ensure levelContent is an array
        const levelContent = Object.entries(chatGPTData.levelContent).map(([level, content]) => ({
          level: parseInt(level, 10),
          ...content
        }));

        return {
          currentLevel: chatGPTData.currentLevel,
          levelContent: levelContent
        };
      } catch (error) {
        console.error('Error fetching data from ChatGPT:', error.message);
        throw new Error('Failed to get descriptions from ChatGPT');
      }
    }
  }
};

// Create and start the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
