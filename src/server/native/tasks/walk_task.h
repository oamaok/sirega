#pragma once

#include "../actor_task.h"
#include "../vec.h"

class WalkTask : public ActorTask {
public:
  vec2 target;
  WalkTask(vec2 target);
  ActorTaskStatus update(Actor &actor, const World &world);
};
