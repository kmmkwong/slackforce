"use strict";

// const cors = require('cors');
let express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('./modules/slack-salesforce-auth'),
    contact = require('./modules/contact'),
    account = require('./modules/account'),
    opportunity = require('./modules/opportunity'),
    report = require('./modules/reports'),
    findReports = require('./modules/findReports'),
    runReport = require('./modules/runReport'),
    queryReport = require('./modules/queryReport'),
    updateReport = require('./modules/updateReport'),
    describeReport = require('./modules/describeReport'),
    _case = require('./modules/case'),
    whoami = require('./modules/whoami'),
    actions = require('./modules/actions'),
    app = express();


// This node server provides REST APIs to acess SF
app.enable('trust proxy');

app.set('port', process.env.PORT || 5000);

// app.use(cors());
app.use(express.json());
app.use('/', express.static(__dirname + '/www')); // serving company logos after successful authentication
app.use(bodyParser.urlencoded({extended: true}));

// Supported slash commands
app.post('/account', account.execute);
app.post('/opportunity', opportunity.execute);
app.post('/report', report.execute);
app.post('/whoami', whoami.execute);

// For report bot
app.post('/findreports', findReports.execute);
app.post('/runreport', runReport.execute);
app.post('/queryreport', queryReport.execute);
app.post('/updatereport', updateReport.execute);
app.post('/describereport', describeReport.execute);

// not used
app.post('/actions', actions.handle);
app.post('/pipeline', opportunity.execute);
app.post('/contact', contact.execute);
app.post('/case', _case.execute);

// Oauth related
app.post('/login', auth.loginLink);
app.post('/logout', auth.logout);
app.get('/login/:slackUserId', auth.oauthLogin);
app.get('/oauthcallback', auth.oauthCallback);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});