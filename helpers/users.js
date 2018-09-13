(() => {
    let crypto = require("crypto");
    let mongoUtil = require("./db")();

    module.exports = {
        hasValidKeys(obj) {
            if(obj["pwd"] && obj["username"] && obj["favoriteColor"])
                return true;
            return false;
        },
        usernameTaken(username) {
            return new Promise((resolve, reject) => {
                mongoUtil.connect(function(err, client) {
                    if(err) reject(err);

                    let res = client.db().collection("sessions").find({ username: username }).limit(1).count();
                    res.then(result => {
                        if(result > 0)
                            resolve(true);
                        else
                            resolve(false);
                    });
                });
            });
        },
        createSessionToken() {
            var sha = crypto.createHash("sha256");
            sha.update(Math.random().toString());
            return sha.digest("hex");
        },
        addToDb(user) {
            return new Promise((resolve, reject) => {
                mongoUtil.connect(function(err, client) {
                    if(err) reject(err);

                    let collection = client.db().collection("sessions");
                    collection.insertOne(user)
                        .then(result => resolve())
                        .catch(err => reject(err));
                });
            });
        },
        clearDb() {
            mongoUtil.connect(function(err, client) {
                client.db().dropDatabase()
                    .catch(err => console.log(err));
            });
        },
        fromSessionOrAnonymous(sess) {
            return new Promise((resolve, reject) => {
                mongoUtil.connect(function(err, client) {
                    let collection = client.db().collection("sessions");
                    collection.findOne({ sessionToken: sess })
                        .then(result => {
                            if(result) {
                                resolve(result);
                            } else {
                                resolve({ anon: true });
                            }
                        });
                });
            });
        },
        fromUsernameOrAnonymous(username) {
            return new Promise((resolve, reject) => {
                mongoUtil.connect(function(err, client) {
                    let collection = client.db().collection("sessions");

                    collection.findOne({ username: username })
                        .then(result => {
                            if(result) {
                                resolve(result);
                            } else {
                                resolve({ anon: true });
                            }
                        });
                });
            });
        },
        getHashedPassword(pwd) {
            return crypto.createHash('sha256').update(pwd).digest('base64');
        }
    };
})();
