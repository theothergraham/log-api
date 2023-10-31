import dotenv from "dotenv";

import app from "./app";

// initialize configuration
let serverEnv = process.env.SERVER_ENV;
serverEnv ??= 'env';
dotenv.config({ path: serverEnv });

const port = process.env.SERVER_PORT;

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
