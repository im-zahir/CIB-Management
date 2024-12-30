const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDMJtCtu4ORamOPUhWqXIJHY1hAyk0sXhs",
  authDomain: "cib-management.firebaseapp.com",
  projectId: "cib-management",
  storageBucket: "cib-management.firebasestorage.app",
  messagingSenderId: "1024396162329",
  appId: "1:1024396162329:web:80b5f2b2d759ddbfc88188",
  measurementId: "G-WP1QTJTY8S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function initializeTestUsers() {
  const testUsers = [
    { email: 'admin@cib.com', password: 'Admin@123' },
    { email: 'manager@cib.com', password: 'Manager@123' },
    { email: 'employee@cib.com', password: 'Employee@123' }
  ];

  for (const user of testUsers) {
    try {
      await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(`Created user: ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`User already exists: ${user.email}`);
      } else {
        console.error(`Error creating user ${user.email}:`, error.message);
      }
    }
  }
}

console.log('Initializing test users...');
initializeTestUsers()
  .then(() => {
    console.log('Test users initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error initializing test users:', error);
    process.exit(1);
  });
