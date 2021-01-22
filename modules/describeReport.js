"use strict";

let auth = require("./slack-salesforce-auth"),
  force = require("./force");

exports.execute = (req, res) => {

  let slackUserId = req.body.user_id,
    oauthObj = auth.getOAuthObject(slackUserId),
    reportId = req.body.report_id;

  force
    .describeReport(oauthObj, reportId)
    .then(data => {
      const result = JSON.parse(data);
      let reportAttr = result.attributes;

      res.json({
        reportName: reportAttr.reportName,
        reportId: reportAttr.reportId,
        result
      });
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