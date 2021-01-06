#include <unordered_map>
#include <memory>
#include "world.h"
#include "actor.h"
#include "actor_message.h"
#include "actor_component.h"

World::World(uint32_t width, uint32_t height): width(width), height(height) { }

void World::send(const ActorMessage &msg) {
  for (auto id : msg.actors) {
    auto search = actors.find(id);
    if (search != actors.end()) {
      search->second->send(msg);
    }
  }
}

void World::spawn(std::unique_ptr<Actor> actor) {
  actors[actor->id] = std::move(actor);
}

void World::update() {
  for(auto& actor : actors) {
    actor.second->update(*this);
  }
}
