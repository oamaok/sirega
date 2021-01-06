#include "actor_message.h"
#include <stdio.h>

ActorMessage::ActorMessage(ActorMessageType type, std::vector<uint32_t> actors)
  : type(type), actors(std::move(actors)) {}
