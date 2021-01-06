#pragma once

#include <stdint.h>
#include <vector>

enum class ActorMessageType : uint32_t {
  WALK = 0,
  GATHER_WOOD = 1,
};

class ActorMessage {
public:
  ActorMessageType type;
  std::vector<uint32_t> actors;
  ActorMessage(ActorMessageType type, std::vector<uint32_t> actors);
};
