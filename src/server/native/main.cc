#include <memory>
#include <node_api.h>
#include <cstdio>

#include "actor.h"
#include "world.h"
#include "actor_message.h"
#include "components/task_queue.h"
#include "messages/walk_command.h"

std::unique_ptr<Actor> createVillager(const vec2 &pos) {
  ActorComponentList components;
  components.emplace_back(new TaskQueueComponent());
  return std::make_unique<Actor>(ActorType::VILLAGER, pos, components);
}

napi_value vec2_to_napi_value(napi_env env, const vec2 &vec) {
  napi_value ret;
  napi_create_object(env, &ret);

  napi_value x, y;
  napi_create_double(env, vec.x, &x);
  napi_create_double(env, vec.y, &y);

  napi_set_named_property(env, ret, "x", x);
  napi_set_named_property(env, ret, "y", y);

  return ret;
}

napi_value actor_to_napi_value(napi_env env, const Actor &actor) {
  napi_value ret;
  napi_create_object(env, &ret);

  napi_value pos = vec2_to_napi_value(env, actor.pos);
  napi_value id, type;
  napi_create_uint32(env, actor.id, &id);
  napi_create_uint32(env, (uint32_t)actor.type, &type);

  napi_set_named_property(env, ret, "id", id);
  napi_set_named_property(env, ret, "pos", pos);
  napi_set_named_property(env, ret, "type", type);

  return ret;
}

napi_value world_get(napi_env env, napi_callback_info args) {
  World* world;
  napi_get_cb_info(env, args, nullptr, nullptr, nullptr, (void**)&world);

  napi_value actors;
  napi_create_array_with_length(env, world->actors.size(), &actors);

  uint32_t idx = 0;
  for (auto &actor : world->actors) {
    napi_set_element(env, actors, idx++, actor_to_napi_value(env, *actor.second));
  }

  napi_value width, height;
  napi_create_uint32(env, world->width, &width);
  napi_create_uint32(env, world->height, &height);

  napi_value ret;
  napi_create_object(env, &ret);
  napi_set_named_property(env, ret, "width", width);
  napi_set_named_property(env, ret, "height", height);
  napi_set_named_property(env, ret, "actors", actors);

  return ret;
}

napi_value world_update(napi_env env, napi_callback_info args) {
  World* world;
  napi_get_cb_info(env, args, nullptr, nullptr, nullptr, (void**)&world);

  world->update();

  napi_value ret;
  napi_get_undefined(env, &ret);
  return ret;
}

napi_value world_send(napi_env env, napi_callback_info args) {
  World* world;
  size_t argc = 1;
  napi_value message;
  napi_get_cb_info(env, args, &argc, &message, nullptr, (void**)&world);

  napi_value message_type;
  napi_get_named_property(env, message, "type", &message_type);

  ActorMessageType type;
  napi_get_value_uint32(env, message_type, (uint32_t*)&type);
  printf("Got message of type %d\n", (int)type);

  std::unique_ptr<ActorMessage> actor_message = nullptr;

  switch (type) {
    case ActorMessageType::WALK: {
      actor_message = WalkCommand::fromNapiValue(env, message);
      break;
    }

    case ActorMessageType::GATHER_WOOD: {
      break;
    }
  }

  if (actor_message) {
    world->send(*actor_message);
  }

  napi_value ret;
  napi_get_undefined(env, &ret);
  return ret;
}

napi_value init(napi_env env, napi_value exports) {
  World *world = new World(200, 200);
  for (int i = 0; i < 100; i++) {
    world->spawn(createVillager({ 10 + i, 10 }));
    world->spawn(createVillager({ 20, 10 + i }));
    world->spawn(createVillager({ 30+ i, 16 }));
    world->spawn(createVillager({ 41, 20+ i }));
  }
  // TODO: Error handling

  napi_value world_get_fn;
  napi_create_function(env, "get", NAPI_AUTO_LENGTH, world_get, (void*)world, &world_get_fn);

  napi_value world_update_fn;
  napi_create_function(env, "update", NAPI_AUTO_LENGTH, world_update, (void*)world, &world_update_fn);

  napi_value world_send_fn;
  napi_create_function(env, "send", NAPI_AUTO_LENGTH, world_send, (void*)world, &world_send_fn);

  napi_value world_obj;
  napi_create_object(env, &world_obj);
  napi_set_named_property(env, world_obj, "get", world_get_fn);
  napi_set_named_property(env, world_obj, "update", world_update_fn);
  napi_set_named_property(env, world_obj, "send", world_send_fn);

  napi_set_named_property(env, exports, "world", world_obj);
  
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
