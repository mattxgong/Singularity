import { copyFile, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const fixture = new URL('../tests/fixtures/phase-6-authoring-post.mdx', import.meta.url)
const target = new URL('../data/blog/phase-6-authoring-fixture.mdx', import.meta.url)
const tagData = new URL('../app/tag-data.json', import.meta.url)
const originalTagData = await readFile(tagData, 'utf8')
const isWindows = process.platform === 'win32'
const {
  PLAYWRIGHT_BASE_URL: _playwrightBaseUrl,
  PLAYWRIGHT_SKIP_WEBSERVER: _playwrightSkipWebserver,
  ...baseEnvironment
} = process.env

function runYarn(arguments_, environment = process.env) {
  return spawnSync('yarn', arguments_, {
    cwd: process.cwd(),
    env: environment,
    shell: isWindows,
    stdio: 'inherit',
  })
}

let restored = false

async function restore() {
  if (restored) return
  restored = true
  await rm(target, { force: true })
  await writeFile(tagData, originalTagData)
}

// `finally` does not run on a signal, which would leave the fixture inside tracked content.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await restore()
    process.exit(1)
  })
}

let exitCode = 1

try {
  await copyFile(fixture, target)
  const result = runYarn(['playwright', 'test', ...process.argv.slice(2)], {
    ...baseEnvironment,
    E2E_AUTHORING_FIXTURE: '1',
  })
  exitCode = result.status ?? 1
} finally {
  await restore()

  // Continuous integration discards the workspace, so only local runs need the artifacts rebuilt.
  if (!process.env.CI) {
    const cleanup = runYarn(['build'], baseEnvironment)
    if (exitCode === 0 && cleanup.status !== 0) exitCode = cleanup.status ?? 1
  }
}

process.exitCode = exitCode
