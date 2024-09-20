# IQ Pilot (Version 2)

iQ-Pilot is an (AARS) Advanced Automated Rostering System for efficient cab management, providing seamless team management, cost optimization, real-time updates, and comprehensive monitoring for administrators.

# # To run this project, follow the steps below:

1. Clone the repository
2. cd into the project frontend and backend directories separately.
3. Run `npm install` in both directories to install dependencies.
4. Add your config.env file to the server directory.
5. Run `npm run dev` on client directory to start the frontend development server
6. Run `npm start` on server directory to start the backend server.
7. Open `http://localhost:5173` in your browser to access the frontend.

# # This project uses the following technologies:

- axios
- dayjs
- framer-motion
- ldrs
- leaflet
- leaflet-routing-machine
- react
- react-dom
- react-leaflet
- react-leaflet-cluster
- react-router-dom
- socket.io-client
- @dnd-kit/core
- @dnd-kit/modifiers
- @dnd-kit/sortable
- @dnd-kit/utilities
- @emotion/react
- @emotion/styled
- @mui/icons-material
- @mui/material
- @mui/x-date-pickers
- @tanstack/react-query
- @tanstack/react-query-devtools
- @types/leaflet
- @vercel/analytics
- @vitejs/plugin-basic-ssl
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- @vitejs/plugin-react-swc
- eslint

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
