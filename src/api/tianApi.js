import axios from "axios"

const API_KEY = "7090836928d34fb19dcac4136e32fd34"
const REQUEST_URL = "http://apis.tianapi.com"

// 天气API接口
export const weatherApi = {
  /**
   * 获取实时天气或七天天气预报
   * @param {string} city_code - 城市名称
   * @param {number} type - 查询类型，实时1，七天7
   */
  getWeather: (city_code) => {
    return axios.get(REQUEST_URL + "/tianqi/index", {
      params: {
        key: API_KEY,
        city: city_code,
        type: 1,
      },
    })
  },
}
