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

  const searchText = req.body.search_text;
  const max = req.body.max ? req.body.max : 5;

  let slackUserId = req.body.user_id,
    oauthObj = auth.getOAuthObject(slackUserId),
    q = "SELECT Id, Name FROM Report";
  //        q = "SELECT Id, Name FROM Report WHERE Name LIKE '%" + req.body.text + "%' LIMIT 5";
  if (searchText) {
    q = q + " WHERE Name LIKE '%" + searchText + "%'";
  }
  q = q + " LIMIT " + max;

  force
    .query(oauthObj, q)
    .then(data => {
      let reports = JSON.parse(data).records;
      let reportList = [];
      if (reports && reports.length > 0) {
        reports.forEach(function(report) {
          reportList.push({
            name: report.Name,
            id: report.Id,
            url: oauthObj.instance_url + "/" + report.Id
          });
        });
      }
      res.json({ search_text: searchText, reports: reportList });
    })
    .catch(error => {
      if (error.code == 401) {
        res
          .status(401)
          .json({
            error:
              `Please *<https://${req.hostname}/login/${slackUserId}|login>* to Salesforce.`
          });
      } else {
        res.status(error.code).json({ error: "An error as occurred" });
      }
    });
};
