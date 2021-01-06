#pragma once

class World;
class Actor;
class ActorMessage;

class ActorComponent {
public:
  virtual void update(Actor &actor, const World &world) = 0;
  virtual void receive(Actor &actor, const ActorMessage &msg) {}
};

