const { ApolloServer, gql } = require('apollo-server');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const Groq = require('groq-sdk');
const getUserKnowledge = require('../database/getUserKnowledge'); // Import the getUserKnowledge function
const addUser = require('../database/addUser'); // Adjusted path for the actual file location

// Initialize OpenAI, Anthropic, and Groq with your API keys
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
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
    getDescriptions(userID: String!, curTopic: String, pageContent: String, model: String!): DescriptionData
  }
`;

// Resolver
const resolvers = {
  Query: {
    getDescriptions: async (_, { userID, curTopic, pageContent, model }) => {
      console.log(`curTopic: ${curTopic}`);
      console.log(`userID: ${userID}`);
      console.log(`model: ${model}`);

      if (!curTopic && !pageContent) {
        throw new Error("curTopic and pageContent are both null!");
      }
      try {
        // Retrieve user knowledge data from DynamoDB
        const genKnowledge = await getUserKnowledge(userID);
        let knowledgePairs = null;
        if (!genKnowledge) {
          await addUser(userID, "null", 0);
        } else {
          knowledgePairs = Object.entries(genKnowledge).map(([topic, level]) => `${topic}: ${level}`).join(', ');
        }

        // Construct the prompt
        let prompt;

        if (curTopic) {
          prompt = `
            RESPONSE SHOULD BE JSON
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
            const data = JSON.parse(response.choices[0].message.content.trim());
            GIVE ME THE RESPONSE IN PLAIN TEXT, NO FORMATTING, WITHOUT MARKDOWN
            DONT INCLUDE A CURTOPIC FIELD
            ONLY JSON RESPONSE NO OTHER TEXT
          `;
        } else {
          prompt = `
            RESPONSE SHOULD BE JSON
            I have user information regarding their knowledge levels in various topics. The topic-level pairings are as follows: {${knowledgePairs}}. The user is on a page that reads:
            ${pageContent}
            Based on the page content, could you generate a one to three word topic that summarizes the page? Then, using that topic phrase, predict this user’s knowledge level on that topic? Return that level under the “currentLevel” field of the return object shown below. Also generate the content for each of the levels, under a nested dictionary called levelContent. Within level content, for each of the 10 levels (1-10 as the keys), there will be a summary (key is tldr) corresponding to a string of text as well as list of topics (key is topics). Within the topics list, there will be around 5 dictionaries, and in each dictionary there will be two elements, a topic corresponding to a string (key is topic) as well as details corresponding to another string related to the topic (key is detail). Can you create the data, where level 1 is at the knowledge of a third grader and level 10 is at the knowledge of a PhD grad, for the overall curTopic, making the TLDRs summarize the topic-detail pairs? This should be a JSON object under the name of “data”. Here is a sample where curTopic is quantum computing:

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
            const data = JSON.parse(response.choices[0].message.content.trim());
            GIVE ME THE RESPONSE IN PLAIN TEXT, NO FORMATTING, WITHOUT MARKDOWN
            DONT INCLUDE A CURTOPIC FIELD
            ONLY JSON RESPONSE NO OTHER TEXT
          `;
        }

        let response;
        if (model === "claude") {
          response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 3000,
            temperature: 0,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          });
        } else if (model === "gpt-4o") {
          response = await openai.chat.completions.create({
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
        } else if (model === "llama") {
          response = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `JSON {
                  "currentLevel": 4,
                  "levelContent": {
                  "1": {
                  "tldr": "GPT-4 is a computer program that can understand and create human-like language.",
                  "topics": [
                  {"topic": "GPT-4", "detail": "A multimodal large language model created by OpenAI."},
                  {"topic": "Language Model", "detail": "A type of artificial intelligence that can process and generate human-like language."},
                  {"topic": "OpenAI", "detail": "The organization that created GPT-4."},
                  {"topic": "Chatbot", "detail": "A computer program that can have conversations with humans."},
                  {"topic": "AI", "detail": "Artificial intelligence, a type of computer program that can think and learn like humans."}
                  ]
                  },
                  "2": {
                  "tldr": "GPT-4 is a more advanced version of a language model that can understand and create human-like language.",
                  "topics": [
                  {"topic": "GPT-4", "detail": "The fourth generation of OpenAI's language model."},
                  {"topic": "Language Generation", "detail": "The ability of a computer program to create human-like language."},
                  {"topic": "Model Training", "detail": "The process of teaching a computer program to understand and generate language."},
                  {"topic": "Multimodal", "detail": "A type of computer program that can understand and process multiple types of data, like text and images."},
                  {"topic": "Foundation Model", "detail": "A type of artificial intelligence that can be used as a base for other AI models."}
                  ]
                  },
                  "3": {
                  "tldr": "GPT-4 is a powerful language model that can understand and generate human-like language, with advanced features like image input.",
                  "topics": [
                  {"topic": "GPT-4", "detail": "A state-of-the-art language model that can process and generate language."},
                  {"topic": "Image Input", "detail": "The ability of GPT-4 to understand and process images."},
                  {"topic": "Vision Capabilities", "detail": "GPT-4's ability to understand and process visual data."},
                  {"topic": "ChatGPT", "detail": "A chatbot powered by GPT-4 that can have conversations with humans."},
                  {"topic": "Microsoft Copilot", "detail": "A tool that uses GPT-4 to assist with tasks like coding and writing."}
                  ]
                  },
                  "4": {
                  "tldr": "GPT-4 is a complex language model that uses a combination of human and AI feedback to improve its performance.",
                  "topics": [
                  {"topic": "GPT-4", "detail": "A highly advanced language model that uses a combination of human and AI feedback."},
                  {"topic": "Reinforcement Learning", "detail": "A type of machine learning that uses rewards and penalties to improve performance."},
                  {"topic": "Human Feedback", "detail": "The process of using human input to improve the performance of a language model."},
                  {"topic": "AI Alignment", "detail": "The process of aligning AI goals with human values and objectives."},
                  {"topic": "Policy Compliance", "detail": "The process of ensuring that AI models comply with human policies and regulations."}
                  ]
                  },
                  "5": {
                  "tldr": "GPT-4 is a highly advanced language model that has the potential to revolutionize the field of natural language processing.",
                  "topics": [
                  {"topic": "GPT-4", "detail": "A state-of-the-art language model that pushes the boundaries of natural language processing."},
                  {"topic": "Natural Language Processing", "detail": "The field of study focused on developing computers that can understand and process human language."},
                  {"topic": "Transformer Architecture", "detail": "The type of neural network architecture used in GPT-4."},
                  {"topic": "Pre-training", "detail": "The process of training a language model on a large dataset before fine-tuning it for specific tasks."},
                  {"topic": "Large Language Model", "detail": "A type of language model that is trained on a massive dataset and has a large number of parameters."}
                  ]
                  },
                  "6": {
                  "tldr": "GPT-4 has many potential applications, including chatbots, writing assistants, and language translation.",
                  "topics": [
                  {"topic": "GPT-4 Applications", "detail": "The many potential uses of GPT-4, including chatbots and writing assistants."},
                  {"topic": "Language Translation", "detail": "The ability of GPT-4 to translate human language in real-time."},
                  {"topic": "Text Generation", "detail": "The ability of GPT-4 to generate human-like text."},
                  {"topic": "Conversational AI", "detail": "The ability of GPT-4 to have conversations with humans."},
                  {"topic": "AI Assistants", "detail": "The ability of GPT-4 to assist humans with tasks like writing and language translation."}
                  ]
                  },
                  "7": {
                  "tldr": "GPT-4 has many limitations and challenges, including bias, training data, and the need for human oversight.",
                  "topics": [
                  {"topic": "GPT-4 Limitations", "detail": "The challenges and limitations of GPT-4, including bias and training data."},
                  {"topic": "Bias in AI", "detail": "The ways in which AI models like GPT-4 can perpetuate human biases."},
                  {"topic": "Training Data", "detail": "The importance of high-quality training data for AI models like GPT-4."},
                  {"topic": "Human Oversight", "detail": "The need for human oversight and guidance when using AI models like GPT-4."},
                  {"topic": "AI Ethics", "detail": "The ethical considerations of developing and using AI models like GPT-4."}
                  ]
                  },
                  "8": {
                  "tldr": "GPT-4 is a highly complex model that requires a deep understanding of AI, machine learning, and natural language processing.",
                  "topics": [
                  {"topic": "GPT-4 Complexity", "detail": "The complexity of GPT-4's architecture and training process."},
                  {"topic": "AI Complexity", "detail": "The complexity of artificial intelligence and machine learning models."},
                  {"topic": "Neural Network Architecture", "detail": "The type of architecture used in GPT-4 and other AI models."},
                  {"topic": "Model Capacity", "detail": "The ability of GPT-4 to process and generate large amounts of language data."},
                  {"topic": "Scalability", "detail": "The ability of GPT-4 to scale to meet the demands of large-scale language processing."}
                  ]
                  },
                  "9": {
                  "tldr": "GPT-4 has the potential to significantly impact many fields, including technology, education, and healthcare.",
                  "topics": [
                  {"topic": "GPT-4 Impact", "detail": "The potential impact of GPT-4 on various fields and industries."},
                  {"topic": "Technology Advancements", "detail": "The ways in which GPT-4 can drive progress in fields like technology and computing."},
                  {"topic": "Education and Healthcare", "detail": "The potential applications of GPT-4 in education and healthcare."},
                  {"topic": "Societal Implications", "detail": "The potential societal implications of GPT-4, including job displacement and bias."},
                  {"topic": "Regulatory Environment", "detail": "The need for regulatory frameworks to govern the development and use of AI models like GPT-4."}
                  ]
                  },
                  "10": {
                  "tldr": "GPT-4 represents a significant advancement in the field of artificial intelligence, with far-reaching implications for many fields and industries.",
                  "topics": [
                  {"topic": "GPT-4 Advancements", "detail": "The significant advancements made by GPT-4 in the field of artificial intelligence."},
                  {"topic": "State-of-the-Art AI", "detail": "GPT-4's status as a state-of-the-art AI model."},
                  {"topic": "AI Research", "detail": "The ongoing research and development of AI models like GPT-4."},
                  {"topic": "Future of AI", "detail": "The potential future applications and implications of AI models like GPT-4."},
                  {"topic": "AI Ethics and Governance", "detail": "The need for ethical considerations and governance frameworks in the development and use of AI models like GPT-4."}
                  ]
                  }
                  }
                  }`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            model: "llama3-70b-8192",
            temperature: 1,
            max_tokens: 3000,
            top_p: 1,
            stream: false,
            response_format: {
              type: "json_object"
            },
            stop: null
          });
        }

        let data;

        if (model === "gpt-4o") {
          data = JSON.parse(response.choices[0].message.content.trim());
        } else if (model === "claude") {
          data = JSON.parse(response.content[0].text.trim());
        } else if (model === "llama") {
          data = JSON.parse(response.choices[0].message.content.trim());
        }

        const levelContent = Object.entries(data.levelContent).map(([level, content]) => ({
          level: parseInt(level, 10),
          ...content
        }));

        return {
          currentLevel: data.currentLevel,
          levelContent: levelContent
        };
      } catch (error) {
        console.error('Error fetching data from model:', error.message);
        console.error('Stacktraces:', error.stack);
        throw new Error('Failed to get descriptions from model');
      }
    }
  }
};

// Create an instance of Express
// const app = express();

// Route to verify OAuth token
// app.get('/verify-token', async (req, res) => {
//   const token = req.headers.authorization;
//   if (!token) {
//     return res.status(401).send('Unauthorized: No token provided');
//   }

//   try {
//     const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
//       headers: { Authorization: `Bearer ${token}` }
//     }).then(response => response.json());

//     if (userInfo.error) {
//       return res.status(401).send('Unauthorized: Invalid token');
//     }

//     // You can now use userInfo.email as the userID
//     res.status(200).send(userInfo);
//   } catch (error) {
//     res.status(500).send('Server error');
//   }
// });

// Create and start the Apollo Server with Express
const server = new ApolloServer({ typeDefs, resolvers });

// server.start().then(res => {
//   server.applyMiddleware({ app });

//   const PORT = 4000;
//   app.listen(PORT, () => {
//     console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
//   });
// });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
