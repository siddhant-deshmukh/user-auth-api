// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
import admin from "firebase-admin"
import serviceAccount from "../serviceAccountKey.json"
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.apiKey,
//   authDomain: process.env.authDomain,
//   projectId: process.env.projectId,
//   storageBucket: process.env.storageBucket,
//   messagingSenderId: process.env.messagingSenderId,
//   appId: process.env.appId,
// };

// // Initialize Firebase
// export const app = initializeApp(firebaseConfig);



admin.initializeApp({
  //@ts-ignore
  credential: admin.credential.cert(serviceAccount),
});

export default admin