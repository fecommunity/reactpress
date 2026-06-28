// @ts-nocheck
const {
  printBanner,
  composeBannerLines,
  deriveSystemState,
  resolveLayout,
  bannerColumns,
} = require('./banner');
const { getCliVersion } = require('../lib/paths');
const { fetchContextStatus, resolveDbType, resolveServiceChecks } = require('../lib/context-status');

const CARD_MIN = 68;
const FRAME_MS = 55;
const MIN_ANIMATION_MS = 2000;

function isInteractiveTTY() {
  return Boolean(process.stdout.isTTY && process.env.TERM !== 'dumb');
}

function mergeStartupComponents(serviceIds, checked) {
  const byId = Object.fromEntries((checked || []).map((c) => [c.id, c.ok]));
  return serviceIds.map((id) => {
    if (byId[id] === undefined) return { id, ok: 'pending' };
    return { id, ok: byId[id] };
  });
}

function paintLines(lines, prevLineCount) {
  if (prevLineCount > 0) {
    process.stdout.write(`\x1b[${prevLineCount}A`);
  }
  for (const line of lines) {
    process.stdout.write('\x1b[2K');
    process.stdout.write(`${line}\n`);
  }
}

async function runStartupBanner(projectRoot, project) {
  const status = await fetchContextStatus(projectRoot);
  printBanner({
    projectRoot,
    project,
    status,
    systemState: deriveSystemState(project, status),
  });
  return status;
}

async function runAnimatedStartupBanner(projectRoot, project) {
  const dbType = await resolveDbType(projectRoot);
  const serviceIds = resolveServiceChecks(dbType);
  const version = getCliVersion();
  const cols = bannerColumns();
  const { showAscii, width } = resolveLayout(cols);

  let total = 0;
  let completed = 0;
  let checked = [];
  let frame = 0;
  let prevLineCount = 0;
  let timer = null;
  let statusResult = null;
  const animStart = Date.now();

  function renderFrame(ready = false) {
    const components = mergeStartupComponents(serviceIds, checked);
    const bannerOpts = {
      projectRoot,
      project,
      status: { components },
      systemState: ready ? deriveSystemState(project, { components }) : 'pending',
    };
    const startup = { frame, completed, total, ready };
    return composeBannerLines(version, bannerOpts, { showAscii, width, startup });
  }

  function paint(ready = false) {
    const lines = renderFrame(ready);
    paintLines(lines, prevLineCount);
    prevLineCount = lines.length;
  }

  const fetchPromise = fetchContextStatus(projectRoot, {
    onProgress({ phase, total: nextTotal, id, ok }) {
      if (phase === 'ready') total = nextTotal;
      if (phase === 'done' && id && !String(id).startsWith('__')) {
        completed += 1;
        checked = [...checked.filter((c) => c.id !== id), { id, ok: Boolean(ok) }];
      }
    },
  }).then((result) => {
    statusResult = result;
    return result;
  });

  timer = setInterval(() => {
    frame += 1;
    paint(false);
  }, FRAME_MS);
  paint(false);

  const status = await fetchPromise;
  if (timer) {
    const remain = Math.max(0, MIN_ANIMATION_MS - (Date.now() - animStart));
    if (remain > 0) {
      await new Promise((resolve) => setTimeout(resolve, remain));
    }
    clearInterval(timer);
    timer = null;
  }

  completed = total;
  paint(true);
  await new Promise((resolve) => setTimeout(resolve, 120));

  if (prevLineCount > 0) {
    process.stdout.write(`\x1b[${prevLineCount}A`);
    for (let i = 0; i < prevLineCount; i += 1) {
      process.stdout.write('\x1b[2K\n');
    }
    process.stdout.write(`\x1b[${prevLineCount}A`);
  }

  const systemState = deriveSystemState(project, status);
  printBanner({ projectRoot, project, status, systemState });
  return statusResult || status;
}

async function refreshBannerWithStartup(projectRoot, project, { animated = true } = {}) {
  const cols = bannerColumns();
  if (!animated || !isInteractiveTTY() || cols < CARD_MIN) {
    return runStartupBanner(projectRoot, project);
  }
  return runAnimatedStartupBanner(projectRoot, project);
}

module.exports = {
  refreshBannerWithStartup,
  runAnimatedStartupBanner,
  runStartupBanner,
  mergeStartupComponents,
  isInteractiveTTY,
};
