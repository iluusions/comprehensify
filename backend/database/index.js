const addNewUser = require('./addUser');
const updateUserKnowledge = require('./updateUserKnowledge');
const getUserKnowledge = require('./getUserKnowledge');

(async () => {
  try {
    await addNewUser('ssidharth.tho@gmail.com', 'History', 4);
    await updateUserKnowledge('ssidharth.tho@gmail.com', 'Science', 6);
    await getUserKnowledge('ssidharth.tho@gmail.com');
  } catch (err) {
    console.error(err);
  }
})();
