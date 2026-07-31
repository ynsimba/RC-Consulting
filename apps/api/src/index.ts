import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { ExpressAuth } from "@auth/express";
import { env } from "./lib/env.js";
import { authConfig } from "./auth/config.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import { appointmentsRouter } from "./routes/appointments.js";
import { blogRouter } from "./routes/blog.js";
import { faqRouter } from "./routes/faq.js";
import { messagesRouter } from "./routes/messages.js";
import { availabilityAdminRouter } from "./routes/availability.js";
import { clientsRouter } from "./routes/clients.js";
import { statsRouter } from "./routes/stats.js";
import { uploadRouter } from "./routes/upload.js";
import { authRouter } from "./routes/auth.js";
import { seoRouter } from "./routes/seo.js";

const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
const webOrigins = Array.from(
  new Set(
    [
      env.webUrl,
      env.webUrl.replace("://www.", "://"),
      env.webUrl.includes("://www.")
        ? env.webUrl
        : env.webUrl.replace("://", "://www."),
    ].filter(Boolean),
  ),
);

app.use(
  cors({
    origin: webOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use("/api/auth", ExpressAuth(authConfig));
app.use(attachUser);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "rc-consulting-api" });
});

app.use("/api", seoRouter);
app.use("/", seoRouter);
app.use("/api/auth-local", authRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/faq", faqRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/admin/availability", availabilityAdminRouter);
app.use("/api/admin/clients", clientsRouter);
app.use("/api/admin/stats", statsRouter);
app.use("/api/admin/upload", uploadRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API RC Consulting on http://localhost:${env.port}`);
});
