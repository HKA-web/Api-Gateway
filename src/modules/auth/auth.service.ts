import jwt from "jsonwebtoken";
import { config } from "../../utils/config";

const ACCESS_SECRET = config.jwt_access || "rahasia-access";
const REFRESH_SECRET = config.jwt_refresh_secret || "rahasia-refresh";

// Dummy user
const DUMMY_USER = {
  username: "admin",
  password: "password123",
};

export class AuthService {
  login(username: string, password: string) {
    if (username === DUMMY_USER.username && password === DUMMY_USER.password) {
      const accessToken = jwt.sign(
		  { username },
		  ACCESS_SECRET,
		  { expiresIn: config.tokenduration || "15m" }
		);

		const refreshToken = jwt.sign(
		  { username },
		  REFRESH_SECRET,
		  { expiresIn: config.refreshduration || "7d" }
		);


      // Idealnya simpan refreshToken di DB/Redis biar bisa di-revoke
      return { accessToken, refreshToken };
    }
    throw new Error("Invalid credentials");
  }

  refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload;
      const newAccessToken = jwt.sign(
        { username: decoded.username },
        ACCESS_SECRET,
        { expiresIn: "15m" }
      );
      return { accessToken: newAccessToken };
    } catch (err) {
      // Jangan balikin Invalid credentials, tapi lebih jelas
      throw new Error("Invalid or expired refresh token");
    }
  }

  verifyAccess(token: string) {
    try {
      return jwt.verify(token, ACCESS_SECRET);
    } catch {
      throw new Error("Access token invalid or expired");
    }
  }
}
