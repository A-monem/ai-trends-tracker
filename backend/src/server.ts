import app from "./app.js";

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(
    `[${new Date().toISOString()}] [INFO] Server running on port ${PORT}`,
  );
  console.log(
    `[${new Date().toISOString()}] [INFO] Environment: ${process.env.NODE_ENV || "development"}`,
  );
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(
    `[${new Date().toISOString()}] [INFO] ${signal} received, shutting down gracefully...`,
  );

  server.close((err) => {
    if (err) {
      console.error(
        `[${new Date().toISOString()}] [ERROR] Error during shutdown:`,
        err,
      );
      process.exit(1);
    }

    console.log(
      `[${new Date().toISOString()}] [INFO] Server closed successfully`,
    );
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      `[${new Date().toISOString()}] [ERROR] Forced shutdown after timeout`,
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;
