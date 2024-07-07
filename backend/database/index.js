const addNewUser = require('./addUser');
const updateUserKnowledge = require('./updateUserKnowledge');
const getUserKnowledge = require('./getUserKnowledge');

(async () => {
  try {
    await addNewUser(3, 'History', 7);
    await updateUserKnowledge(1, 'Science', 2);
    await getUserKnowledge(1);
  } catch (err) {
    console.error(err);
  }
})();
