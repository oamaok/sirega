#include "task_queue.h"
#include "../actor_message.h"
#include "../messages/walk_command.h"
#include "../tasks/walk_task.h"

void TaskQueueComponent::update(Actor &actor, const World &world) {
  if (queue.size() == 0) return;
  ActorTaskStatus status = queue.front()->update(actor, world);
  if (status == ActorTaskStatus::FINISHED) queue.pop();
}

void TaskQueueComponent::receive(Actor &actor, const ActorMessage &msg) {
  switch(msg.type) {
    case ActorMessageType::WALK: {
      auto &cmd = (const WalkCommand&)msg;
      queue.emplace(new WalkTask(cmd.target));
      break;
    }

    case ActorMessageType::GATHER_WOOD: {
      break;
    }
  }
}
