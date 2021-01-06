#pragma once

#include <queue>
#include <memory>
#include "../actor_component.h"
#include "../actor_task.h"

class ActorTask;

class TaskQueueComponent : public ActorComponent {
  std::queue<std::unique_ptr<ActorTask>> queue;

public:
  void update(Actor &actor, const World &world);
  void receive(Actor &actor, const ActorMessage &msg);
};
