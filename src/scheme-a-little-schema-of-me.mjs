export default {
  commitComment: {
    body: String,
    createdAt: Number,
    updatedAt: Number,
    user: Number, // FK
  },
  issueComment: {
    body: String,
    createdAt: Number,
    issue: Number, // FK
    updatedAt: Number,
    user: Number, // FK
  },
  issue: {
    body: String,
    // comments: Number, // issues have a comments count, but who knows which types of comments that includes...
    createdAt: Number,
    isPullRequest: Boolean,
    number: Number,
    repo: Number, // FK
    state: String,
    title: String,
    updatedAt: Number,
    user: Number, // FK
  },
  reviewComment: {
    body: String,
    createdAt: Number,
    issue: Number, // FK
    updatedAt: Number,
    user: Number, // FK
  },
  repo: {
    cloneURL: String,
    createdAt: Number,
    name: String,
    updatedAt: Number,
  },
  state: {
    lastRun: Number,
    lastSuccessMembers: Number,
    lastSuccessRepos: Number,
    lastSuccessRun: Number,
    org: String,
    repo: Object,  // per-repo state, indexed by repoID
    //  {
    //    repoID (Number): {
    //      lastSuccessIssueComments: Number,
    //      lastSuccessIssues: Number,
    //      lastSuccessReviewComments: Number,
    //      lastSuccessRun: Number,
    //    },
    //  }
  },
  user: {
    isDeleted: Boolean,
    login: String,
    name: String,
  },
};
