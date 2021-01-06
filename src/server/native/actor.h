#pragma once

#include <stdint.h>
#include <vector>
#include <memory>
#include "vec.h"

class World;
class ActorComponent;
class ActorMessage;

enum class ActorType : uint32_t { VILLAGER = 0 };

typedef std::vector<std::unique_ptr<ActorComponent>> ActorComponentList;

class Actor {
  static uint32_t nextId;

public:
  uint32_t id;
  ActorType type;
  vec2 pos;
  ActorComponentList components;
  Actor(ActorType type, const vec2 &pos, ActorComponentList &comps);
  
  void update(const World &world);
  void send(const ActorMessage &msg);
};
