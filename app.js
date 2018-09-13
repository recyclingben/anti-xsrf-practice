(async () => {
    let express = require("express");
    let app = express();
    let bodyParser = require("body-parser");
    let cookieParser = require("cookie-parser");

    let path = require("path");
    let fs = require("fs");

    let mongoClient = require("mongodb").MongoClient;
    let uri = `mongodb+srv://ben:${ fs.readFileSync("./db-pw.txt", "utf-8") }@sessions-sof4q.mongodb.net/test?retryWrites=true`;

    let mongoUtil = require("./helpers/db")(uri, mongoClient);

    (function configureApp(app) {
        app.use("/static", express.static(__dirname + '/public'));
        app.use(bodyParser.json());
        app.use(cookieParser());

        require("./routes.js")(app);
    })(app);
    app.listen(3001);
})();
