"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    ACCOUNT_TOKEN = process.env.SLACK_ACCOUNT_TOKEN;

exports.execute = (req, res) => {

    // if (req.body.token != ACCOUNT_TOKEN) {
    //     console.log("Invalid token");
    //     res.send("Invalid token");
    //     return;
    // }

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        q = "SELECT Id, Name FROM Report WHERE Name LIKE '%" + req.body.text + "%' LIMIT 5";

    force.query(oauthObj, q)
        .then(data => {
            let reports = JSON.parse(data).records;
            if (reports && reports.length>0) {
                let attachments = [];
                reports.forEach(function(report) {
                    let fields = [];
                    fields.push({title: "Name", value: report.Name, short:true});
                    // fields.push({title: "Phone", value: account.Phone, short:true});
                    // if (account.BillingAddress) {
                    //     fields.push({title: "Address", value: account.BillingAddress.street, short:true});
                    //     fields.push({title: "City", value: account.BillingAddress.city + ', ' + account.BillingAddress.state, short:true});
                    // }
                    fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + report.Id, short:false});
                    attachments.push({color: "#7F8DE1", fields: fields});
                });
                res.json({text: "Reports matching '" + req.body.text + "':", attachments: attachments});
            } else {
                res.send("No records");
            }
        })
        .catch(error => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);
            } else {
                res.send("An error as occurred");
            }
        });
};