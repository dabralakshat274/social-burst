const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { errorHandler } = require("./middleware/errorHandler");
const connectDB = require("./config/dbConnection");
const passport = require("passport");
const socialRoute = require("./routes/socialRoutes");
const swaggerSpec = require("./config/swaggerConfig");
const eventRoutes = require("./routes/event_Routes");
const eventCategoryRoutes = require("./routes/eventCategory_Routes");
const groupChatRoutes = require("./routes/groupChat_Route");
const addressRoutes = require("./routes/address_Routes");
const adminRouter = require("./routes/admin_Route");
const reportRoutes = require("./routes/report_Routes");
const notificationRoutes = require("./routes/notification_Route");
const feeedbackRoutes = require("./routes/feedback_Route");
const businessCategoryRoutes = require("./routes/businessCategoryRoutes");
const { startScheduledJobs } = require("./services/schedulerService");

const app = express();

const http = require("http");
const { initSocket } = require("./socket"); //  Socket setup file
const { Server } = require("https");

// Create HTTP server manually to bind Socket.io
const server = http.createServer(app);

// Start Socket.io server
initSocket(server);

// // Start Server with socket support
// server.listen(port, "0.0.0.0", () => {
//   console.log(`🚀 Server running on http://localhost:${port}`);
//   console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
// });

require("./services/subscriptionExpiryServices");
require("./services/webhookServices");

const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRouter);

app.use("/api/auth", socialRoute);

// routes for Subscription Testing
app.use("/api/dev", require("./routes/devTestRoutes"));
// app.use("/api/webhooks", require("./routes/webhookRoutes"));

// Routes for Event and Event Category
app.use("/api/events", eventRoutes); // Event Routes
app.use("/api/event-categories", eventCategoryRoutes); // Event Category Routes
app.use("/api/business", businessCategoryRoutes); // Business Category Routes
app.use("/api/events", groupChatRoutes); // Group Chat Routes
app.use("/api/users", addressRoutes); // Address Routes
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedbacks", feeedbackRoutes); // Feedback Routes

// New route for one-click close account
app.use("/api/account", require("./routes/account_Close_Routes"));

// Initialize Passport
app.use(passport.initialize());

app.use("/api/users", require("./routes/userRoutes"));

// app.use("/api/alerts", require("./routes/alertRoute"));

// app.use("/api/forums", require("./routes/forumRoutes"));

// Admin Routes
// app.use("/api/admin", require("./routes/adminRoutes"));
// adminSubscriptionRoutes
// app.use("/api/admin", require("./routes/adminSubscriptionRoute"));

// Swagger Setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Burst API",
      version: "1.0.0",
      description: "API documentation for user and contact management",
    },
    servers: [
      {
        url: "/",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

// const swaggerSpec = swaggerJSDoc(options);
app.use("/docs/secret", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handler
app.use(errorHandler);

// Start Server
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
  startScheduledJobs();
});
