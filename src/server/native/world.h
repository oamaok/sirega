#pragma once

#include <stdint.h>
#include <unordered_map>
#include <memory>

class Actor;
class ActorMessage;

class World {
public:
  uint32_t width, height;
  std::unordered_map<uint32_t, std::unique_ptr<Actor>> actors;
  World(uint32_t width, uint32_t height);
  void send(const ActorMessage &msg);
  void spawn(std::unique_ptr<Actor> actor);
  void update();
};
