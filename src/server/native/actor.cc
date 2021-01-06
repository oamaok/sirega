#include "actor.h"
#include "actor_component.h"

uint32_t Actor::nextId = 0;

Actor::Actor(ActorType type, const vec2 &pos, ActorComponentList &comps)
  : id(nextId++), type(type), pos(pos), components(std::move(comps)) { }

void Actor::update(const World &world) {
  for (auto &component : components) {
    if (component) component->update(*this, world);
  }
}

void Actor::send(const ActorMessage &msg) {
  for (auto &component : components) {
    if (component) component->receive(*this, msg);
  }
}
