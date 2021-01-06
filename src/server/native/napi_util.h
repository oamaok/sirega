#include <vector>
#include <node_api.h>

namespace napiUtil {
  template <typename T> napi_status getValue(napi_env env, napi_value val, T *res);
  template <> napi_status getValue<uint32_t>(napi_env env, napi_value val, uint32_t *res) {
    return napi_get_value_uint32(env, val, res);
  }
  template <> napi_status getValue<int32_t>(napi_env env, napi_value val, int32_t *res) {
    return napi_get_value_int32(env, val, res);
  }

  template <typename T> std::vector<T> vectorFromNapiValue(napi_env env, napi_value arr) {
    uint32_t len;
    napi_get_array_length(env, arr, &len);

    std::vector<T> res;
    res.reserve(len);

    napi_value raw_val;
    T val;
    for (uint32_t i = 0; i < len; i++) {
      napi_get_element(env, arr, i, &raw_val);
      getValue<T>(env, raw_val, &val);
      res.push_back(val);
    }

    return res;
  }
}