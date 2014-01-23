var crypto = require('crypto');
var https = require('https');
var console = require('console');
var querystring = require('querystring');

var accessKeyID = require('./api-key.json').accessKeyID;
var secrectAccessKey = require('./api-key.json').secrectAccessKey;

function GenerateSignature (method, uri, url) {
    var content = method + '\n' + uri + '\n' + url;

    var signature = crypto.createHmac('sha1', secrectAccessKey).update(
        method + '\n' + uri + '\n' + url).digest();

    return url + '&signature=' + new Buffer(signature).toString('base64');
}

function SendRequest (method, uri, url) {
    var options = {
        hostname: 'api.qingcloud.com',
        port: 443,
        method: method,
        path: uri + '?' + url
    };

    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);

        res.on('data', function(d) {
            process.stdout.write(d);
        });
    });

    req.end();

    req.on('error', function(e) {
        console.error(e);
    });
}

function GenerateURL (object) {
    return querystring.stringify(object);
}

function GenerateTimeStamp () {
    //Thu, 23 Jan 2014 12:08:57 GMT
    //2013-08-27T13:58:35Z
    var utc = new Date().toUTCString();

    var monthMap = {'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'};

    return utc.slice(12, 16) + '-' + monthMap[utc.slice(8, 11)] + '-' + utc.slice(5, 7) + 'T'
        + utc.slice(17, 25) + 'Z';
}

var method = 'GET', uri = '/iaas/';

var command = {
    access_key_id: accessKeyID,
    action: 'DescribeInstances',
    signature_method: 'HmacSHA1',
    signature_version: '1',
    time_stamp: GenerateTimeStamp(),
    version: '1',
    zone: 'pek1'
};

var url = GenerateURL(command);

url = GenerateSignature(method, uri, url);

SendRequest(method, uri, url);
