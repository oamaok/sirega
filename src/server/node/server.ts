import { readFileSync } from 'fs'
import { resolve, normalize } from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { world, ActorMessage } from './world'

const server = createServer((req, res) => {
  const { url } = req

  if (!url) {
    res.statusCode = 404
    res.end('404')
    return
  }

  if (url === '/') {
    res.setHeader('Content-Type', 'text/html')
    res.end(readFileSync(resolve(__dirname, '../../client/index.html')))
    return
  }

  if (url === '/client.js') {
    res.setHeader('Content-Type', 'application/javascript')
    res.end(readFileSync(resolve(__dirname, '../../../dist/client.js')))
    return
  }

  if (url.startsWith('/assets/')) {
    const [,, unsafeFile] = url.split('/')

    const file = normalize(unsafeFile).replace(/^(\.\.(\/|\\|$))+/, '')
    res.end(readFileSync(resolve(__dirname, `../../../assets/${file}`)))
    return
  }

  res.statusCode = 404
  res.end('404')
})

server.listen(8080)

const io = new Server(server, {
  path: '/ws',
})

io.on('connection', (socket) => {
  socket.emit('update', world.get())
  socket.on('command', (cmd: ActorMessage) => {
    console.log(cmd)
    world.send(cmd)
  })
})

setInterval(() => {
  console.time('world.update')
  world.update()
  console.timeEnd('world.update')
  io.sockets.emit('update', world.get())
}, 16)
