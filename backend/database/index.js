const addNewUser = require('./addUser');
const updateUserKnowledge = require('./updateUserKnowledge');
const getUserKnowledge = require('./getUserKnowledge');

(async () => {
  try {
    await addNewUser('example@example.com', 'History', 7);
    await updateUserKnowledge('example@example.com', 'Science', 2);
    await getUserKnowledge('example@example.com');
  } catch (err) {
    console.error(err);
  }
})();
