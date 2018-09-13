(() => {
    let crypto = require("crypto");
    // Don't change this without serious consideration of what you're doing.
    let salt = "saltyboy";

    module.exports = {
        generateCsrfToken(session) {
            return crypto.createHash('sha256').update(session + salt).digest('base64');
        },
        verifyCsrfToken(session, token) {
            if (crypto.createHash('sha256').update(session + salt).digest('base64') === token)
                return true;
            else {
                console.log(crypto.createHash('sha256').update(session + salt).digest('base64'));
                console.log(token);
            }
        }
    };
})();
