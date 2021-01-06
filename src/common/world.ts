export enum ActorType {
  VILLAGER = 0
}

export type ActorId = number

type vec2 = { x: number, y: number }

export type Actor = {
  id: ActorId
  type: ActorType
  pos: vec2
}

export type WorldData = {
  width: number
  height: number
  actors: Actor[]
}

export enum ActorMessageType {
  WALK = 0,
  GATHER_WOOD = 1,
}

export type ActorMessage = {
  type: ActorMessageType.WALK
  actors: ActorId[]
  target: vec2
} | {
  type: ActorMessageType.GATHER_WOOD
  actors: ActorId[]
  target: vec2
}
