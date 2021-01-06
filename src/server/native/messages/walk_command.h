#pragma once

#include <memory>
#include "../actor_message.h"
#include "../vec.h"

class WalkCommand : public ActorMessage {
public:
  vec2 target;
  WalkCommand(std::vector<uint32_t> actors, vec2 target);
  static std::unique_ptr<WalkCommand> fromNapiValue(napi_env env, napi_value value);
};
