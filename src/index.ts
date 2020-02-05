import { Application, Octokit, Context } from "probot";

const BOT_NAME = "wisserke";

const defaultConfig = (() => {
  const WISSERKE_GIF_URL = "https://media.giphy.com/media/w8CGgakbif4iOZri06/giphy.gif";
  const WISSERKE_BODY = `![](${WISSERKE_GIF_URL})`;

  const SHAME_GIF_URL = "https://media.giphy.com/media/m6tmCnGCNvTby/giphy.gif";
  const SHAME_BODY = `Small PR's, am I right?\n\n![](${SHAME_GIF_URL})`;


  const PERCENTAGE_DIFF = 10;
  const SMALL_PR_FILES_THRESHOLD = 150;

  return {
    WISSERKE_GIF_URL,
    WISSERKE_BODY,
    SHAME_GIF_URL,
    SHAME_BODY,
    PERCENTAGE_DIFF,
    SMALL_PR_FILES_THRESHOLD,
  }
})();

type ConfigType = typeof defaultConfig | null;

export = (app: Application) => {
  app.log("App has been loaded");

  app.on(["pull_request.opened", "pull_request.synchronize", "pull_request.edited"], async (context) => {
    app.log(`Receiving an event of type ${context.event}`);

    // @ts-ignore
    const config: ConfigType = await context.config<ConfigType>("wisserke.yml", defaultConfig);
    context.log(`Context loaded: ${JSON.stringify(config)}`);
    if (!config) return;

    const { WISSERKE_GIF_URL, WISSERKE_BODY, SHAME_GIF_URL, SHAME_BODY, PERCENTAGE_DIFF, SMALL_PR_FILES_THRESHOLD } = config;

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
    if (!isSmallPr(context, changed_files, SMALL_PR_FILES_THRESHOLD) && !hasCommentedShameGif(context, comments, SHAME_GIF_URL)) {
      context.log(`${prNumber} is not a small PR`);
      // Deprecation: [@octokit/rest] "number" parameter is deprecated for ".issues.createComment()". Use "issue_number" instead
      const { number, ...rest } = context.issue({ body: SHAME_BODY });

      await context.github.issues.createComment({ ...rest, issue_number: number })
        .catch((e) => context.log(`ERROR: smallPr ${JSON.stringify(e)}`));
    }

    // if the pr has more deletions than additions and no wisserke comment has been made, create a shame comment
    if (isWisserke(context, additions, deletions, PERCENTAGE_DIFF) && !hasCommentedWisserkeGif(context, comments, WISSERKE_GIF_URL)) {
      context.log(`${prNumber} is a wisserke`);
      // Deprecation: [@octokit/rest] "number" parameter is deprecated for ".issues.createComment()". Use "issue_number" instead
      const { number, ...rest }  = context.issue({ body: WISSERKE_BODY });

      await context.github.issues.createComment(({ ...rest, issue_number: number }))
        .catch((e) => context.log(`ERROR: wisserke ${JSON.stringify(e)}`));;
    }
  })
}

const isSmallPr = (context: Context, filesChanged: number, threshold: number) => {
  const isSmall = filesChanged < threshold;

  context.log(`isSmallPr: ${isSmall}`);
  return isSmall;
}

const isWisserke = (context: Context, additions: number, deletions: number, minDiff: number) => {
  const wisserke = (((deletions - additions) / deletions) * 100) > minDiff
  context.log(`isWisserke: ${wisserke}`);

  return wisserke
}

// check if any of the comments is made by a bot account which has our bot name and if the comment includes the gif url
const hasCommentedShameGif = (context: Context, comments: Octokit.Response<Octokit.IssuesListCommentsResponse>, url: string) => {
  const has = !!comments.data.filter((comment) =>
    comment.user.type.toLowerCase().includes("bot")
    && comment.user.login.toLowerCase().includes(BOT_NAME)
    && comment.body.toLowerCase().includes(url.toLowerCase())
  ).length;

  context.log(`hasCommentedShameGif: ${has}`)
  return has;
}

// check if any of the comments is made by a bot account which has our bot name and if the comment includes the gif url
const hasCommentedWisserkeGif = (context: Context, comments: Octokit.Response<Octokit.IssuesListCommentsResponse>, url: string) => {
  const has = !!comments.data.filter((comment) => 
    comment.user.type.toLowerCase().includes("bot")
    && comment.user.login.toLowerCase().includes(BOT_NAME)
    && comment.body.toString().toLowerCase().includes(url.toLowerCase())
  ).length;

  context.log(`hasCommentedWisserkeGif: ${has}`)
  return has;
}
