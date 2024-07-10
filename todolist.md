# Project Todo List

## MVP (Minimum Viable Product)

1. **Integrate Different Models** - Completed
   - Integrate various models instead of only GPT-4o (e.g., LLaMA 3, Phi, Claude 3).
   - Allow users to choose the model they prefer, with more expensive ones costing more.

2. **User Authentication** - Completed
   - Implement authentication using Google or username/password.

3. **Update User Info Table** - Completed
   - Update the user info table whenever a user queries the model with a new topic.

4. **Use Current Topic as Title/Header** - Completed
   - Use the `curTopic` as the title/header.

5. **Cache Current Level** - MVP
   - Cache the `curLevel`.

6. **Fix Loading Bug** - MVP
   - Fix the bug where "LOADING" initially shows up when data is in cache.

7. **Fix JSON Formatting Bug** - MVP
   - Ensure the JSON object from ChatGPT is always formatted correctly.

8. **Cleanup** - MVP
   - Refine the prompts for ChatGPT/models.
   - Improve HTML reading.
   - Remove unnecessary console.logs/alerts.
   - Other refinements and adjustments.

## Future Enhancements

1. **Enhanced User Features**
   - Add quizzes, annotations/highlights to the webpage.
   - Provide definitions for complex words.
   - Include initial assessments, history, etc.

2. **Server-Side Caching**
   - Implement caching for model calls to optimize performance.

3. **Dashboard for Organizers**
   - Create a dashboard for organizers (parents, school districts, teachers) to monitor student performance.

4. **Client-Side Model**
   - Develop a client-side model that sits on the user’s PC, reads the text, etc., making it more cost-effective (e.g., using Phi).

## Side Important Tasks

1. **Make the Paper: V1** - Completed
   - Develop the first version of the paper.

2. **Update the Paper: V2**
   - Refine the paper by incorporating feedback, adding more detailed explanations, improving the overall structure, and ensuring clarity and coherence.

3. **Explore Code Generation with English**
   - Make another paper on the concept of generating code using English.
   - Organize previous conversations to format them into documentation.