# Collegio🎓

Collegio is a **mobile-first platform for engineering students** to buy, sell, and request services within their campus.  
It makes it easy to exchange goods like textbooks, calculators, or lab kits, and also connect for services such as tutoring, homework help, or printing.  

The project is built as a **full-stack mobile app**, with a React Native frontend and a Node.js + Express backend, connected through RESTful APIs and real-time features.

---

##  Features

- **Authentication**
  - User login and signup.
  
- **Goods Marketplace**
  - Browse items (name, description, image, price, contact).
  - Post goods with details (name, description, image, price, phone number).
  - Show interest in goods → seller is notified (email/notification planned).

- **Services Hub**
  - Browse/offer/request services (name, description, price offered, deadline, contact).
  - Post services with details (name, description, deadline, price, phone number).
  - Show interest in services → service owner gets notified.

- **Interest Tracking**
  - Tab to view all goods/services you have posted.
  - Tab to view all goods/services you have shown interest in.
  - Future: a tab to see who has shown interest in your posts.  

- **Notifications**
  - Bell icon → shows recent activity and recent posts.
  - Future: in-app push notifications with Socket.IO.

---

##  Tech Stack

**Frontend**  
- React Native 
- React Navigation 
- Redux / Zustand 

**Backend**  
- Node.js + Express.js (REST APIs)  
- MongoDB 

##  Future Scope

- **User Notifications** → Notify users instantly when someone shows interest in their goods/services .  
- **Interest Tab** → Dedicated tab where sellers can see the list of users who have shown interest in their posts.  
- **In-App Chat** → Built-in chat system so buyers and sellers can directly communicate within the app.  
- **Digital Payments** → Integration with UPI / online payment gateways instead of limiting transactions to cash.  

---

##  Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/Collegio.git
cd Collegio
```

### 2. Setup Backend

Go to backend folder:
```bash
cd backend
npm install
```

Create a .env file:
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

You can get your MongoDB connection string from MongoDB Atlas
.

Example:
```bash
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/collegioDB?retryWrites=true&w=majority
```

Run backend:
```bash
node server.js
```
### 3. Setup Frontend

Go to frontend folder:
```bash
cd ../frontend
npm install
```

Start React Native Metro bundler:
```bash
npx react-native start
```  

Run app on Android emulator:
```bash
npx react-native run-android
```

⚠️ Note: For local testing on Android Emulator, use http://10.0.2.2:5000 instead of http://localhost:5000 when calling backend APIs.  

## Demo Screenshots  

### Auth  
<p float="left">
  <img src="./assets/Login.png" alt="Login" width="250"/>
  <img src="./assets/Signup.png" alt="Signup" width="250"/>
</p>

### Home & Updates  
<p float="left">
  <img src="./assets/Home.png" alt="Home" width="250"/>
  <img src="./assets/Updates.png" alt="Updates" width="250"/>
</p>

### Goods & Services  
<p float="left">
  <img src="./assets/GoodsList.png" alt="Goods List" width="250"/>
  <img src="./assets/ServicesList.png" alt="Services List" width="250"/>
</p>

### Posting  
<p float="left">
  <img src="./assets/PostGoods.png" alt="Post Goods" width="250"/>
  <img src="./assets/PostService.png" alt="Post Service" width="250"/>
</p>


