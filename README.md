# Collegio🎓

Collegio is a **mobile-first platform for students** to buy, sell, and request services within their campus.  
It makes it easy to exchange goods like textbooks, calculators or lab kits and also connect for services such as tutoring, homework help etc.  

The project is built as a **full-stack mobile app**, with a React Native frontend and a Node.js + Express backend, connected through RESTful APIs and real-time features.

---

##  Features

- **Authentication**
  - User login and signup (name, college email, phone, password).

- **Goods Marketplace**
  - Browse items
  - Post goods with details, price, and a photo
  - Show interest in goods → seller is notified and can see who's interested.

- **Services Hub**
  - Browse/offer/request services
  - Post services with details, payment, and a deadline
  - Show interest in services → service owner gets notified.

- **Lost & Found**
  - Browse everything reported as lost or found on campus, with Lost/Found filter chips.
  - Post an item as Lost or Found, with title, description, and location. A photo is required when marking something as Found.
  - "This is mine" / "I found it" → notifies the original poster, who can see the claimant's name, email, and phone number.

- **Interest Tracking (Updates)**
  - Tab to view all goods/services/lost & found posts you've made.
  - Tab to view everything you've shown interest in.
  - Tab to see who has shown interest in your posts.

- **Notifications**
  - Bell icon on Home → shows a live count of interest shown on your posts across all three categories.

- **Bold Badge design system**
  - Custom visual identity across every screen: ink-bordered cards with hard offset shadows that collapse on press, the Outfit font family, and hand-built `react-native-svg` icons (no icon fonts).
  - Floating pill-shaped bottom navigation (Home / Goods / Post / Services / Lost & Found) that stays mounted across tab switches, so there's no reload/spinner flash when moving between tabs.


---

##  Tech Stack

**Frontend**
- React Native (bare CLI, not Expo) + TypeScript
- React Navigation (native-stack + bottom-tabs)
- Axios for API calls, AsyncStorage for auth token/session
- react-native-svg (icons), react-native-image-picker, react-native-dotenv (env config)

**Backend**
- Node.js + Express.js (REST APIs)
- MongoDB + Mongoose
- JWT auth (Bearer token) + bcrypt password hashing
- Multer for image uploads (goods photos, lost & found photos)

##  Future Scope

- **User Notifications** → Notify users instantly through email when someone shows interest in their goods/services/lost & found posts.
- **In-App Chat** → Built-in chat system so users can directly communicate within the app instead of relying on the exposed phone/email.
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

Create a `.env` file (the API URL depends on how you're running the app, see the note below):
```bash
REACT_APP_API_URL=http://10.0.2.2:5000
```

Start React Native Metro bundler:
```bash
npx react-native start
```  

Run app on Android:
```bash
npx react-native run-android
```

⚠️ **Note on `REACT_APP_API_URL`:**
- **Android Emulator (AVD)**: use `http://10.0.2.2:5000`. `10.0.2.2` is a special alias the emulator maps back to your PC's `localhost`.
- **Physical phone** (USB/Wi-Fi): `10.0.2.2` won't resolve. Use your PC's actual LAN IP instead (e.g. `http://192.168.x.x:5000`, found via `ipconfig`), make sure the phone is on the **same Wi-Fi network**, and that your firewall allows inbound connections to port 5000.
- Since `react-native-dotenv` bakes this value into the JS bundle at build time, restart Metro with `npx react-native start --reset-cache` after changing `.env`.


