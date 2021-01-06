#pragma once

#include <node_api.h>
#include <cmath>

struct vec2 { 
  float x, y;

  vec2 add(const vec2 vec) const {
    return {
      x + vec.x, y + vec.y
    };
  }

  vec2 sub(const vec2 &vec) const {
    return {
      x - vec.x, y - vec.y
    };
  }

  vec2 scale(float scalar) const {
    return {
      x * scalar, y * scalar
    };
  }

  vec2 normalize() {
    return this->scale(1.0f / this->length());
  }

  float length() {
    return sqrt(x * x + y * y);
  }

  float distance(const vec2 &vec) {
    return sub(vec).length();
  }

  static vec2 fromNapiValue(napi_env env, napi_value value) {
    napi_value x, y;
    napi_get_named_property(env, value, "x", &x);
    napi_get_named_property(env, value, "y", &y);

    double resx, resy;
    napi_get_value_double(env, x, &resx);
    napi_get_value_double(env, y, &resy);

    vec2 res { (float)resx, (float)resy };

    return res;
  } 
};
