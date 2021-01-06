const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const { HotUpdateChunk } = require('webpack')

const debounce = (fn) => {
  let debounceTimeout = null
  return (...args) => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => fn(...args), 100)
  }
}

const getSubDirectories = (dir) => {
  const stack = [dir]
  const res = []
  while (currentDir = stack.pop()) {
    const dirs = fs.readdirSync(currentDir)
      .map(entry => path.resolve(currentDir, entry))
      .filter(entry => fs.lstatSync(entry).isDirectory())
    stack.push(...dirs)
    res.push(...dirs)
  }
  return res
}

const watchDirectory = (dir, cb) => {
  const dirs = [dir, ...getSubDirectories(dir)]

  let watchers = []
  
  const hook = debounce(() => {
    watchers.forEach(watcher => watcher.close())
    watchers = dirs.map(dir => fs.watch(dir, hook))
    cb()
  })

  hook()
}

const outputLines = (pipeIn, pipeOut, prefix) => {
  let buf = ''
  pipeIn.on('data', (data) => {
    buf += data.toString()
    if (buf.includes('\n')) {
      const lines = buf.split('\n')
      lines.slice(0, -1).forEach(line => {
        pipeOut.write(`[${prefix}] ${line}\n`)
      })
      buf = lines.pop()
    }
  })
}

const startServer = () => {
  const proc = cp.spawn('npx', [
    'tsnd',
    '-P',
    path.resolve(__dirname, './src/server/node/tsconfig.json'),
    path.resolve(__dirname, './src/server/node/server.ts'),
  ])

  outputLines(proc.stdout, process.stdout, 'srv')
  outputLines(proc.stderr, process.stderr, 'srv')
  return proc
}

let serverProcess = startServer()

const restartServer = () => {
  process.stdout.write('=== Restarting server ===\n')
  serverProcess.kill()
  serverProcess = startServer()
}

const rebuildNative = () => new Promise((resolve) => {
  process.stdout.write('=== Rebuilding native ===\n')
  const proc = cp.spawn('node-gyp', ['configure', 'build'])
  outputLines(proc.stdout, process.stdout, 'build')
  outputLines(proc.stderr, process.stderr, 'build')
  proc.on('close', resolve)
})

watchDirectory(path.resolve(__dirname, './src/server/native'), async () => {
  await rebuildNative()
  restartServer()
})

watchDirectory(path.resolve(__dirname, './src/server/node'), restartServer)
