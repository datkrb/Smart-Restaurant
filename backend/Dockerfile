# Sử dụng node image bản đầy đủ hoặc đảm bảo có openssl
FROM node:20-alpine

# Cài đặt openssl cho Prisma (Sửa lỗi openssl-1.1.x warn)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
# Quan trọng: Cài đặt xong phải generate prisma ngay tại đây
RUN npm install

COPY . .

# LỆNH QUAN TRỌNG: Tạo ra engine tương ứng với Linux trong container
RUN npx prisma generate

RUN npm run build

EXPOSE 4000
CMD ["npm", "run", "dev"]