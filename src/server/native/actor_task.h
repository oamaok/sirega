#pragma once

#include <stdint.h>

class Actor;
class World;

enum class ActorTaskType : uint32_t {
  WALK = 0,
  GATHER_WOOD = 1,
};

enum class ActorTaskStatus  : uint32_t {
  IN_PROGRESS,
  FINISHED,
};

class ActorTask {
public:
  ActorTaskType type;
  ActorTask(ActorTaskType type) : type(type) {}
  virtual ActorTaskStatus update(Actor &actor, const World &world) = 0;
};
