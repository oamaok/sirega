import io from 'socket.io-client'
import { Vec2 } from '../common/vec2'
import {
  WorldData, ActorMessage, ActorType,
} from '../common/world'

function mouseEventToVec2(evt: MouseEvent): Vec2 {
  return new Vec2(evt.clientX, evt.clientY)
}

function mouseEventToDOMPoint(evt: MouseEvent): DOMPoint {
  return new DOMPoint(evt.clientX, evt.clientY)
}

type Camera = {
  pos: Vec2
  zoom: number
}

const GRID_SIZE = 64

type Selection = {
  startPos: DOMPoint
  endPos: DOMPoint
}

function getGridTransform(camera: Camera, context: CanvasRenderingContext2D) {
  const scale = 2 ** camera.zoom
  return new DOMMatrix([

    scale * 2, scale,
    -scale * 2, scale,
    -camera.pos.x + context.canvas.width * 0.5, -camera.pos.y + context.canvas.height * 0.5,
  ])
}

function isInSelection(pos: DOMPoint, selection: Selection, transform: DOMMatrix) {
  const { startPos, endPos } = selection
  const screenSpacePosition = transform.transformPoint(new DOMPoint(pos.x * GRID_SIZE, pos.y * GRID_SIZE))

  const topLeft = new DOMPoint(Math.min(startPos.x, endPos.x), Math.min(startPos.y, endPos.y))
  const bottomLeft = new DOMPoint(Math.max(startPos.x, endPos.x), Math.max(startPos.y, endPos.y))

  return screenSpacePosition.x > topLeft.x
    && screenSpacePosition.x < bottomLeft.x
    && screenSpacePosition.y > topLeft.y
    && screenSpacePosition.y < bottomLeft.y
}

function renderWorld({
  selection, world, camera, context, cursor, selectedActors,
}: {
  selectedActors: number[],
  world: WorldData,
  camera: Camera,
  selection: Selection | null,
  cursor: DOMPoint,
  assets: Map<ImageAssetNames, ImageAsset>
  context: CanvasRenderingContext2D
}) {
  const t = Date.now()

  context.resetTransform()
  context.fillStyle = '#171717'
  context.fillRect(0, 0, context.canvas.width, context.canvas.height)

  const gridTransform = getGridTransform(camera, context)

  context.setTransform(gridTransform)

  context.fillStyle = '#b86f50'
  context.fillRect(0, 0, world.width * GRID_SIZE, world.height * GRID_SIZE)

  context.fillStyle = 'rgba(255, 255, 255, 0.25)'

  for (let i = 0; i <= world.width; i++) {
    context.fillRect(i * GRID_SIZE, 0, 1, world.width * GRID_SIZE)
  }
  for (let i = 0; i <= world.height; i++) {
    context.fillRect(0, i * GRID_SIZE, world.height * GRID_SIZE, 1)
  }

  /*
  world.resources.forEach((res: any) => {
    if (res.type === 'wood') {
      context.fillStyle = '#265c42'
      context.fillRect(
        res.pos.x * GRID_SIZE,
        res.pos.y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE,
      )
    }
  })
  */

  world.actors.forEach((actor) => {
    if (actor.type === ActorType.VILLAGER) {
      if (selectedActors.includes(actor.id)) {
        context.fillStyle = 'rgba(255, 255, 255, 0.5)'
        context.fillRect(
          actor.pos.x * GRID_SIZE,
          actor.pos.y * GRID_SIZE,
          GRID_SIZE,
          GRID_SIZE,
        )
      }

      context.fillStyle = '#cc3333'
      context.fillRect(
        actor.pos.x * GRID_SIZE + 2,
        actor.pos.y * GRID_SIZE + 2,
        GRID_SIZE - 4,
        GRID_SIZE - 4,
      )

      if (selection) {
        if (isInSelection(new DOMPoint(actor.pos.x, actor.pos.y), selection, gridTransform)) {
          context.strokeStyle = '#00ff00'
          context.lineWidth = 1
          context.beginPath()
          context.moveTo(actor.pos.x * GRID_SIZE, actor.pos.y * GRID_SIZE)
          context.lineTo(actor.pos.x * GRID_SIZE, actor.pos.y * GRID_SIZE + GRID_SIZE)
          context.lineTo(actor.pos.x * GRID_SIZE + GRID_SIZE, actor.pos.y * GRID_SIZE + GRID_SIZE)
          context.lineTo(actor.pos.x * GRID_SIZE + GRID_SIZE, actor.pos.y * GRID_SIZE)
          context.closePath()
          context.stroke()
        }
      }
    }
  })

  context.fillStyle = `rgba(255, 255, 255, ${Math.sin(t * 0.0075) * 0.05 + 0.3})`

  const toGridCoordinates = new DOMMatrix().scale(1 / GRID_SIZE).multiply(gridTransform.inverse())

  if (!selection) {
    const gridCursor = toGridCoordinates.transformPoint(cursor)
    context.fillRect(
      Math.floor(gridCursor.x) * GRID_SIZE + 1,
      Math.floor(gridCursor.y) * GRID_SIZE + 1,
      GRID_SIZE - 1,
      GRID_SIZE - 1,
    )
  }

  context.resetTransform()

  /*
  world.resources.forEach((res: any) => {
    if (res.type === 'wood') {
      const scale = 2 ** camera.zoom
      const pos = gridTransform.transformPoint(new DOMPoint(res.pos.x * GRID_SIZE, res.pos.y * GRID_SIZE))

      const treeAsset = assets.get('tree')
      if (treeAsset) {
      context.drawImage(
        treeAsset.image,
        Math.floor(pos.x) - 128 * scale,
        Math.floor(pos.y) - 180 * scale,
        GRID_SIZE * 4 * scale,
        GRID_SIZE * 4 * scale,
      )
      }
    }
  })
  */

  if (selection) {
    context.strokeStyle = 'rgba(255, 255, 255, 0.75)'
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(selection.startPos.x, selection.startPos.y)
    context.lineTo(selection.endPos.x, selection.startPos.y)
    context.lineTo(selection.endPos.x, selection.endPos.y)
    context.lineTo(selection.startPos.x, selection.endPos.y)
    context.closePath()
    context.stroke()
  }
}
type Drag = {
  lastPos: Vec2
}

const LEFT_MBTN = 0
const MIDDLE_MBTN = 1
const RIGHT_MBTN = 2

type ImageAssetNames = 'tree'

type ImageAssetDefinition = {
  name: ImageAssetNames
  src: string
  offset: Vec2
}

type ImageAsset = ImageAssetDefinition & {
  image: HTMLImageElement
}

const IMAGE_ASSETS = [{
  name: 'tree',
  src: '/assets/tree.png',
  offset: new Vec2(128, 180),
}] as const

function loadImageAsset(asset: ImageAssetDefinition): Promise<ImageAsset> {
  return new Promise((resolve) => {
    const image = new Image()
    image.src = asset.src
    image.onload = () => resolve({
      ...asset,
      image,
    })
  })
}

async function main() {
  const canvas = document.querySelector('canvas')

  if (!canvas) {
    throw new Error('No canvas element found')
  }

  let canvasWidth = 0
  let canvasHeight = 0

  const resizeCanvas = () => {
    canvasWidth = window.innerWidth
    canvasHeight = window.innerHeight
    canvas.width = canvasWidth
    canvas.height = canvasHeight
  }
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Failed to initialize rendering context')
  }

  context.imageSmoothingEnabled = false

  const assets: ImageAsset[] = await Promise.all(IMAGE_ASSETS.map(loadImageAsset))
  const assetMap: Map<ImageAssetNames, ImageAsset> = new Map(assets.map((asset) => [asset.name, asset]))

  let world: WorldData = { width: 0, height: 0, actors: [] }

  const camera: Camera = {
    pos: new Vec2(),
    zoom: 0.25,
  }

  const socket = io('', {
    path: '/ws',
  })

  socket.on('update', (w: WorldData) => {
    world = w
  })

  let selection: Selection | null = null
  let drag: Drag | null = null

  canvas.addEventListener('wheel', (evt) => {
    let scale = 1
    if (evt.deltaMode === WheelEvent.DOM_DELTA_PIXEL) scale = 0.04
    if (evt.deltaMode === WheelEvent.DOM_DELTA_LINE) scale = 1.3333

    camera.zoom -= evt.deltaY * 0.1 * scale
  })

  let currentPos = new DOMPoint()
  let selectedActors: number[] = []

  const handleSelect = (selection: Selection) => {
    const gridTransform = getGridTransform(camera, context)
    selectedActors = world.actors
      .filter((actor: any) => isInSelection(actor.pos, selection, gridTransform))
      .map((actor: any) => actor.id)
  }

  function handleMouseOut() {
    if (drag) drag = null
    if (selection) {
      handleSelect(selection)
      selection = null
    }
  }

  const sendMessage = (msg: ActorMessage) => {
    socket.emit('command', msg)
  }

  canvas.addEventListener('contextmenu', (evt) => {
    evt.preventDefault()
  })

  canvas.addEventListener('mousedown', (evt) => {
    if (selection || drag) {
      return
    }

    switch (evt.button) {
      case LEFT_MBTN:
        selection = {
          startPos: mouseEventToDOMPoint(evt),
          endPos: mouseEventToDOMPoint(evt),
        }
        break
      case MIDDLE_MBTN:
        drag = {
          lastPos: mouseEventToVec2(evt),
        }
        break
      case RIGHT_MBTN:
        const gridTransform = getGridTransform(camera, context)

        const toGridCoordinates = new DOMMatrix().scale(1 / GRID_SIZE).multiply(gridTransform.inverse())
        const gridCoordinates = toGridCoordinates.transformPoint(mouseEventToDOMPoint(evt))
        sendMessage({
          type: 0,
          target: {
            x: Math.floor(gridCoordinates.x),
            y: Math.floor(gridCoordinates.y),
          },
          actors: selectedActors,
        })
    }
  })

  canvas.addEventListener('mousemove', (evt) => {
    currentPos = mouseEventToDOMPoint(evt)

    if (drag) {
      camera.pos = camera.pos.add(drag.lastPos.sub(currentPos))
      drag.lastPos = new Vec2(currentPos)
    }

    if (selection) {
      selection.endPos = currentPos
    }
  })

  canvas.addEventListener('mouseup', handleMouseOut)
  canvas.addEventListener('mouseout', handleMouseOut)

  const gameLoop = () => {
    if (world) {
      renderWorld({
        assets: assetMap,
        world,
        camera,
        cursor: currentPos,
        selection,
        context,
        selectedActors,
      })
    }

    window.requestAnimationFrame(gameLoop)
  }

  gameLoop()
}

main()
