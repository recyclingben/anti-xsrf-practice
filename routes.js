(() => {
    let fs = require("fs");
    let hbs = require("express-handlebars");
    let path = require("path");
    let csrf = require("./helpers/csrf");
    let userUtil = require("./helpers/users");
    let userFactory = require("./user-factory");
    let mongoUtil = require("./helpers/db")();

    let _app;

    const setupEngine = () => {
        hbsInstance = hbs({
            defaultLayout: "template",
            helpers: {
                strEscape(str) {
                    return str.replace(/(['"])/g, '\\$1');
                }
            }
        });
        _app.engine("handlebars", hbsInstance);
        _app.set("view engine", "handlebars");
        _app.set("views", path.join(__dirname, "views"));
    };
    const hasSessionCookie = (req) => {
        if(req.cookies["SESSION"])
            return true;
        return false;
    };
    const removeSessionCookie = (res) => {
        res.clearCookie("SESSION");
    };
    const getUserOrAnonymous = async (req) => {
        return await userUtil.fromSessionOrAnonymous(req.cookies["SESSION"]);
    };

    module.exports =
    (app) => {
        _app = app;
        setupEngine();

        _app.use("*",
            async (req, res, next) => {
                res.locals.user = await userUtil.fromSessionOrAnonymous(req.cookies["SESSION"]);
                res.locals.page = {
                    title: "Home"
                };
                res.locals.csrfToken = csrf.generateCsrfToken(req.cookies["SESSION"]);
                next();
            });

        _app.get(["/", "/home", "/home/index"],
            (req, res) => {
                res.render("home");
            });

        _app.get(["/about", "/home/about"],
            (req, res) => {
                res.render("about");
            });

        _app.get(["/account/login"],
            (req, res) => {
                res.render("account-login");
            });

        _app.post(["/account/login"],
            async (req, res) => {
                let user = await userUtil.fromUsernameOrAnonymous(req.body.username);

                console.log(userUtil.getHashedPassword(req.body.pwd) + " " + user.hPwd);

                if(!user.anon && user.hPwd === userUtil.getHashedPassword(req.body.pwd))
                    res.cookie("SESSION", user.sessionToken, { httpOnly: true });
                res.send();
            });

        _app.get(["/account", "/account/profile"],
            (req, res) => {
                res.render("account-profile");
            });

        _app.get(["/account/logout"],
            async (req, res) => {
                res.render("account-logout");
            });

        _app.post(["/account/logout"],
            (req, res) => {
                removeSessionCookie(res);
                res.send();
            });

        _app.get(["/account/create"],
            (req, res) => {
                res.render("account-create");
            });

        _app.post(["/account/create"],
            async (req, res) => {
                const body = req.body;

                if(userUtil.hasValidKeys(body)) {
                    let user = userFactory({
                        username: body.username,
                        pwd: body.pwd,
                        favoriteColor: body.favoriteColor
                    });

                    let usernameTaken = await userUtil.usernameTaken(user.username);
                    if(!usernameTaken) {
                        await userUtil.addToDb(user);
                        res.cookie("SESSION", user.sessionToken, { httpOnly: true });
                        res.send();
                    }
                } else {
                    res.status(400);
                    res.send();
                }
            });

        _app.get(["/account/delete"],
            async (req, res) => {
                res.render("account-delete", {
                    page: {
                        title: "Account Deletion"
                    }
                });
            });

        _app.post(["/account/delete"],
            (req, res) => {
                if(csrf.verifyCsrfToken(res.locals.user.sessionToken, req.get("X-CSRF-Token"))) {
                    mongoUtil.connect(async (err, client) => {
                        let collection = client.db().collection("sessions");

                        await collection.deleteOne({ sessionToken: req.cookies["SESSION"] });
                        res.send();
                    });
                }
                else {
                    res.status(403);
                    res.send();
                }
            });
  };
})();
