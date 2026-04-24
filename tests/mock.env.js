// Valid values
process.env.DB_KEY = "mongodb+srv://testuser:password@cluster.mongodb.net";
process.env.PORT = "3000";
process.env.DEBUG = "true";
process.env.JWT_SECRET = "supersecretkeythatisatleast32chars!!";

// Invalid values (commented out by default, uncomment per test)
// process.env.PORT = "notanumber"
// process.env.DEBUG = "yes"
// process.env.JWT_SECRET = "short"
