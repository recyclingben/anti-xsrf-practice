(() => {
    let _db;
    let _mongoClient;
    let _uri;

    module.exports = function(uri, mongoClient) {
        if(mongoClient)
            _mongoClient = mongoClient;
        if(uri)
            _uri = uri;

        return {
            connect(cb) {
                _mongoClient.connect(_uri, { useNewUrlParser: true }, function(err, database) {
                    if(!_db)
                        _db = database;
                    cb(err, database);
                    _db.close();
                });
            }
        };
    };
})();
