require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
});
