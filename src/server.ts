import dotenv from "dotenv";

import app from "./app";

// initialize configuration
dotenv.config({ path: 'env' });

const port = process.env.SERVER_PORT;

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
