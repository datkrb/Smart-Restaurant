// src/server.ts
import "dotenv/config";
import { server } from "./app"; // IMPORT SERVER TỪ APP.TS ĐỂ CÓ ROUTE VÀ SOCKET.IO

const PORT = process.env.PORT || 4000;

// XÓA BỎ DÒNG: const app = express();
// VÌ NÓ TẠO RA MỘT APP MỚI TRỐNG RỖNG

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 API Register: http://localhost:${PORT}/api/v1/auth/register`);
});
