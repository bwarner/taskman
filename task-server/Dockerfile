# 🐳 1️⃣ Use the official Node.js 22 image
FROM node:22

# 🏗 2️⃣ Set working directory inside the container
WORKDIR /usr/src/app

# 📜 3️⃣ Copy package files first (optimizes Docker caching)
COPY package.json package-lock.json ./

# 📦 4️⃣ Install dependencies
RUN npm install --omit=dev

# 📝 5️⃣ Copy the rest of the application code
COPY . .

# ⚙️ 6️⃣ Build TypeScript (if using TypeScript)
RUN npm run build

# 🔥 7️⃣ Expose the app's port
EXPOSE 8080

# 🚀 8️⃣ Start the server
CMD ["node", "dist/server.js"]
