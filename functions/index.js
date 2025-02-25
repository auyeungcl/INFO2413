const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.checkSeedQuantities = functions.pubsub.schedule("every month").onRun(async (context) => {
  const db = admin.firestore();
  const seeds = db.collection("SeedStats");
  let seedsToOrder = "";
  await seeds.get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      if (doc.data().totalAmount < 500) {
        seedsToOrder += doc.id + ", ";
      }
    });
  });

  return {
    response: seedsToOrder,
  };
});

exports.register = functions.https.onCall(async (data, context) => {
  await admin
    .auth()
    .createUser({
      email: data.email,
      emailVerified: true,
      password: data.password,
      disabled: false,
    })
    .then((user) => {
      console.log(user);
      //create a new firestore user document in the AccountDetails Collection
      const doc = admin
        .firestore()
        .collection("AccountDetails")
        .doc(user.uid)
        .set({
          name: data.name,
          accountType: data.accountType,
          email: data.email,
        })
        // .then(() => {
        //   if (data.accountType === "Gardener") {
        //     const doc = admin
        //       .firestore()
        //       .collection("AccountDetails")
        //       .doc(user.uid)
        //       .collection("GardenerStats")
        //       .doc("GardenerStats")
        //       .set({});
        //   }
        // })
        .catch((error) => {
          throw new functions.https.HttpsError("failed to create a user");
        });
    });

  return {
    response: "User created successfully",
  };
});

exports.deleteUser = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .https.onCall(async (data, context) => {
    await admin
      .auth()
      .deleteUser(data.uid)
      .then((user) => {
        console.log(user);
        if (data.accountType === "Gardener") {
          console.log("TRYING TO DELETE GARDENER");
        }
        admin.firestore().collection("AccountDetails").doc(data.uid).delete();
        return {
          response: "User deleted successfully",
        };
      })
      .catch((error) => {
        throw new functions.https.HttpsError("failed to delete a user");
      });

    return {
      response: "User deleted successfully",
    };
  });

exports.listAllUsers = functions.https.onCall(async (data, context) => {
  const users = await admin.auth().listUsers();
  return users.users;

  // await admin
  //   .auth()
  //   .listUsers()
  //   .then((listUsersResult) => {
  //     listUsersResult.users.forEach((userRecord) => {
  //       console.log("user", userRecord.toJSON());
  //     });
  //     return {
  //       response: listUsersResult,
  //     };
  //   })
  //   .catch((error) => {
  //     console.log("Error listing users:", error);
  //   });

  // return {
  //   response: "User list successfully",
  // };
});
