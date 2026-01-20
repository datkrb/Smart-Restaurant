import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-default";

// Local Strategy: Login with email/password
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: any, password: any, done: any) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Check if email is verified
        if (!user.isVerified) {
          return done(null, false, { message: "Please verify your email before logging in." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy: Access protected routes
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        // jwtPayload must contain userId based on how we sign it in token.ts
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.userId },
        });

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google OAuth Strategy (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(null, false);

        // 1. Kiểm tra xem user có tồn tại chưa
        let user = await prisma.user.findUnique({ where: { email } });

        // 2. Nếu chưa có -> Tự động đăng ký
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName,
              password: "", // Không có pass
              role: "CUSTOMER",
              isVerified: true, // Google đã verify email rồi
              avatarUrl: profile.photos?.[0].value
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  ));
} else {
  console.log('⚠️ Google OAuth disabled: GOOGLE_CLIENT_ID/SECRET not configured');
}

export default passport;
