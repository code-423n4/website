import { Handler } from "@netlify/functions";
import { Response } from "@netlify/functions/src/function/response";
import { Event } from "@netlify/functions/src/function/event";
import { Octokit } from "@octokit/core";
import fetch from "node-fetch";

import { Finding, FindingsResponse } from "../../types/findings";

import { checkAuth } from "../util/auth-utils";
import { getContest, isContestActive } from "../util/contest-utils";
import { wardenFindingsForContest } from "../util/github-utils";

async function getFindings(req: Event): Promise<Response> {
  // first phase:
  // given active! contest id
  // [x] warden can see own findings
  // [x] warden can see team findings
  // [ ] can see specific finding

  // todo: ensure contestId / wardenHandle exist?
  const contestId = parseInt(req.queryStringParameters?.contest!);
  const wardenHandle = req.headers["c4-user"];

  // let issueNumber;
  // if (req.queryStringParameters?.issue) {
  //   issueNumber = parseInt(req.queryStringParameters?.issue);
  // }

  // todo: move to util?
  let teamHandles = [];
  try {
    const teamUrl = `${process.env.URL}/.netlify/functions/get-team?id=${wardenHandle}`;
    const teams = await fetch(teamUrl);
    if (teams.status === 200) {
      const teamsData = await teams.json();
      teamHandles = teamsData.map((team) => team.handle);
    }
  } catch (error) {
    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ error: error.message || error }),
    };
  }

  const contest = await getContest(contestId);

  if (!isContestActive(contest)) {
    // throw?
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const wardenFindings: Finding[] = await wardenFindingsForContest(
    octokit,
    wardenHandle,
    contest
  );

  const res: FindingsResponse = {
    user: wardenFindings,
    teams: {},
  };

  // if (req.queryStringParameters?.teamFindings) {

  // }

  for (const teamHandle of teamHandles) {
    const teamFindings: Finding[] = await wardenFindingsForContest(
      octokit,
      teamHandle,
      contest
    );
    res.teams[teamHandle] = teamFindings;
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(res),
  };
}

async function editFinding(req) {
  // an authenticated warden can edit a finding
  //   for active contests
  //     their own (their teams')
  // [ ] should add "edited-by-warden"
  // [ ] add GH comment for "edited by" ${C4-User}
  /*
  {
    "issue": 70,
    "contest": 999999,
    "emailAddresses": ["dzhawsh@code4rena.com"],
    
    "attributedTo"?: {oldValue, newValue, wallet},
    // or maybe just include with attributedTo?
       "address"?: newValue, // only if attributedTo changes
    "risk"?: {oldValue, newValue},
    "title"?: "QA Report",
    "body"?: (combined with links to code on client-side),
  }
  */

  // get contest to find repo
  // modifications to issueid

  // did attribution change?
  // rename json file (and alter "address" key with wallet address)

  // did risk change?
  // remove old risk label / apply new risk label

  // did title change?
  // simple field update

  // did body change?
  // simple field update

  // apply edited-by-warden label

  // create GH comment indicating C4-User

  // send e-mails

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
}

const handler: Handler = async (event: Event): Promise<Response> => {
  // todo: error handling..

  if (!(await checkAuth(event))) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: "Unauthorized",
      }),
    };
  }

  switch (event.httpMethod) {
    case "GET":
      // @todo: determine if single-issue or all-issue (or cheat?)
      return await getFindings(event);
    case "POST":
      return await editFinding(event);
    default:
      return {
        statusCode: 418,
        body: JSON.stringify({
          error: "nuh-uh",
        }),
      };
  }
};

export { handler };
