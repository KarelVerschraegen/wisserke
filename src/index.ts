import { Application, Octokit, Context } from "probot"

const WISSERKE_GIF_URL = "https://media.giphy.com/media/w8CGgakbif4iOZri06/giphy.gif";
const WISSERKE_BODY = `![](${WISSERKE_GIF_URL})`;

const SHAME_COMMENT_TEXT = "Small PR's, am I right?";
const SHAME_GIF_URL = "https://media.giphy.com/media/m6tmCnGCNvTby/giphy.gif";
const SHAME_BODY = `${SHAME_COMMENT_TEXT}\n\n![](${SHAME_GIF_URL})`;

const BOT_NAME = "wisserke";

const PERCENTAGE_DIFF = 10;
const SMALL_PR_FILES_THRESHOLD = 50;

export = (app: Application) => {
  app.log("App has been loaded");

  app.on(["pull_request.opened", "pull_request.synchronize", "pull_request.edited"], async (context) => {
    app.log(`Receiving an event of type ${context.event}`);

    // if the event is from a bot or if the pull request is closed, ignore
    if (context.isBot || (context.payload.pull_request && context.payload.pull_request.state.toLowerCase().includes("closed"))) return;
    context.log(`Handling the event of type ${context.event} because the user is not a bot and the PR is still open`);

    const { owner, repo } = context.repo();
    const { additions, deletions, changed_files } = context.payload.pull_request;
    const prNumber = context.payload.number;
    context.log(`Currently handling PR #${prNumber} with ${additions} additions, ${deletions} deletions and ${changed_files} files changed`);

    // Github considers PRs as another type of issue, this is why we query issues instead of pulls
    const comments = await context.github.issues.listComments({ owner, repo, issue_number: prNumber });

    // If the pr is small and no shame comment has been made, create a shame comment
    if (!isSmallPr(changed_files) && !hasCommentedShameGif(context, comments)) {
      context.log(`${prNumber} is not a small PR`);
      // Deprecation: [@octokit/rest] "number" parameter is deprecated for ".issues.createComment()". Use "issue_number" instead
      const { number, ...rest } = context.issue({ body: SHAME_BODY });

      await context.github.issues.createComment({ ...rest, issue_number: number })
        .catch((e) => context.log(`ERROR: smallPr ${JSON.stringify(e)}`));
    }

    // if the pr has more deletions than additions and no wisserke comment has been made, create a shame comment
    if (isWisserke(additions, deletions) && !hasCommentedWisserkeGif(context, comments)) {
      context.log(`${prNumber} is a wisserke`);
      // Deprecation: [@octokit/rest] "number" parameter is deprecated for ".issues.createComment()". Use "issue_number" instead
      const { number, ...rest }  = context.issue({ body: WISSERKE_BODY });

      await context.github.issues.createComment(({ ...rest, issue_number: number }))
        .catch((e) => context.log(`ERROR: wisserke ${JSON.stringify(e)}`));;
    }
  })
}

const isSmallPr = (filesChanged: number, threshold: number = SMALL_PR_FILES_THRESHOLD) => (
  filesChanged < threshold
);

const isWisserke = (additions: number, deletions: number, minDiff: number = PERCENTAGE_DIFF) => (
  (((deletions - additions) / deletions) * 100) > minDiff
)

// check if any of the comments is made by a bot account which has our bot name and if the comment includes the gif url
const hasCommentedShameGif = (context: Context, comments: Octokit.Response<Octokit.IssuesListCommentsResponse>) => {
  const has = !!comments.data.filter((comment) =>
    comment.user.type.toLowerCase().includes("bot")
    && comment.user.login.toLowerCase().includes(BOT_NAME)
    && comment.body.toLowerCase().includes(SHAME_GIF_URL.toLowerCase())
  ).length;

  context.log(`hasCommentedShameGif: ${has}`)
  return has;
}

// check if any of the comments is made by a bot account which has our bot name and if the comment includes the gif url
const hasCommentedWisserkeGif = (context: Context, comments: Octokit.Response<Octokit.IssuesListCommentsResponse>) => {
  const has = !!comments.data.filter((comment) => 
    comment.user.type.toLowerCase().includes("bot")
    && comment.user.login.toLowerCase().includes(BOT_NAME)
    && comment.body.toString().toLowerCase().includes(WISSERKE_GIF_URL.toLowerCase())
  ).length;

  context.log(`hasCommentedWisserkeGif: ${has}`)
  return has;
}
