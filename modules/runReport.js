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
    reportId = req.body.report_id;

  force
    .runReport(oauthObj, reportId)
    .then(data => {
      const result = JSON.parse(data);
      let reportAttr = result.attributes;

      res.json({
        reportName: reportAttr.reportName,
        reportId: reportAttr.reportId,
        url: oauthObj.instance_url + "/" + reportId,
        result
      });

      // if (reportAttr) {
      //     let attachments = [];
      //     let fields = [];
      //     fields.push({title: "Name", value: reportAttr.reportName, short:true});
      //     fields.push({title: "Id", value: reportAttr.reportId, short:true});
      //     // fields.push({title: "Phone", value: account.Phone, short:true});
      //     // if (account.BillingAddress) {
      //     //     fields.push({title: "Address", value: account.BillingAddress.street, short:true});
      //     //     fields.push({title: "City", value: account.BillingAddress.city + ', ' + account.BillingAddress.state, short:true});
      //     // }
      //     fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + reportAttr.reportId, short:false});
      //     attachments.push({color: "#7F8DE1", fields: fields});
      //     res.json({text: "Report run result for : '" + req.body.text + "':", attachments: attachments});
      // } else {
      //     res.send("No result result");
      // }
    })
    .catch(error => {
      if (error.code == 401) {
        res.status(401).json({
          error:
            `Please *<https://${req.hostname}/login/${slackUserId}|login>* to Salesforce.`
        });
      } else {
        res.status(error.code).json({ error: "An error as occurred" });
      }
    });
};
