#include <memory>
#include "walk_command.h"
#include "../napi_util.h"
#include <stdio.h>

WalkCommand::WalkCommand(std::vector<uint32_t> actors, vec2 target)
  : ActorMessage(ActorMessageType::WALK, actors), target(target) {}

std::unique_ptr<WalkCommand> WalkCommand::fromNapiValue(napi_env env, napi_value value) {
  napi_value actors, target;

  napi_get_named_property(env, value, "actors", &actors);
  napi_get_named_property(env, value, "target", &target);

  return std::make_unique<WalkCommand>(
    napiUtil::vectorFromNapiValue<uint32_t>(env, actors),
    vec2::fromNapiValue(env, target)
  );
}
