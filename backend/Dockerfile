# Sử dụng node image bản đầy đủ hoặc đảm bảo có openssl
FROM node:20-alpine

# Cài đặt openssl cho Prisma và libc6-compat để chạy binary
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
# Quan trọng: Cài đặt xong phải generate prisma ngay tại đây
RUN npm install

COPY . .

# LỆNH QUAN TRỌNG: Tạo ra engine tương ứng với Linux trong container
# RUN npx prisma generate

# RUN npm run build

EXPOSE 4000
CMD ["npm", "run", "dev"]