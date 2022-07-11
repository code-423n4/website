// wip: endpoint for self-serve submission editing

function getFindings(req) {
  // the request needs to come from an authenticated warden
  // they can see their findings for active contests
  // they can see their teams' findings for active contests
  // there are some parameters?
  return {
    statusCode: 200,
    body: "Get OK",
  };
}

function editFinding(req) {
  // an authenticated warden can edit a finding
  //   for active contests
  //     their own (their teams')
  return {
    statusCode: 200,
    body: "Edit OK",
  };
}

export async function handler(event) {
  switch (event.httpMethod) {
    case "GET":
      return getFindings(event);
    case "POST":
      return editFinding(event);
  }
};
