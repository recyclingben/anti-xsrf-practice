let crypto = require("crypto");
let userUtil = require("./helpers/users");

module.exports =
({username, pwd, favoriteColor}) => {
    hPwd = userUtil.getHashedPassword(pwd);

    return {
        username: username,
        hPwd: hPwd,
        favoriteColor: favoriteColor,
        sessionToken: userUtil.createSessionToken(),
        changePwd(to) {
          this.hPwd = crypto.createHash('sha256').update(to).digest('base64');
        }
    };
};
