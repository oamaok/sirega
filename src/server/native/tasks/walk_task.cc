#include "walk_task.h"
#include "../actor.h"

WalkTask::WalkTask(vec2 target) : ActorTask(ActorTaskType::WALK), target(target) {}

ActorTaskStatus WalkTask::update(Actor &actor, const World &world) {
  auto direction = actor.pos.sub(target).normalize();
  actor.pos = actor.pos.sub(direction.scale(0.25f));

  if (actor.pos.distance(target) < 0.5f) {
    return ActorTaskStatus::FINISHED;
  }

  return ActorTaskStatus::IN_PROGRESS;
}
