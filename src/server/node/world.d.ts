import { WorldData, ActorMessage } from '../../common/world'

type World = {
  get(): WorldData
  send(msg: ActorMessage): void
  update(): void
}

export { ActorMessage }

export const world: World
