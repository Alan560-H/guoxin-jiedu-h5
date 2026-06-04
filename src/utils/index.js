/**
 * @desc 函数节流
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param type 1 使用表时间戳，在时间段开始的时候触发 2 使用表定时器，在时间段结束的时候触发
 */
export const throttle = (func, wait = 1000, type = 1) => {
	let previous = 0;
	let timeout;
	return function() {
		let context = this;
		let args = arguments;
		if (type === 1) {
			let now = Date.now();

			if (now - previous > wait) {
				func.apply(context, args);
				previous = now;
			}
		} else if (type === 2) {
			if (!timeout) {
				timeout = setTimeout(() => {
					timeout = null;
					func.apply(context, args)
				}, wait)
			}
		}
	}
}
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}
/**
 * 秒格式，通常用于倒计时时毫秒转时分秒格式
 * @param {number} second
 * @returns {Array} ['00', '00', '00']
 */
export function formatSecondToTime(seconds) {
  let hour = seconds >= 3600 ? Math.floor(seconds/3600) : 0;
  let secondOfMinute = seconds - hour * 3600;
  let minute = secondOfMinute >= 60 ? Math.floor(secondOfMinute/60) : 0;
  let second = seconds - hour * 3600 - minute * 60;
  return [
    hour < 10 ? ('0' + hour) : hour,
    minute < 10 ? ('0' + minute) : minute,
    second < 10 ? ('0' + second) : second 
  ]
}
/**
 * 时辰判断
 * @param {String} time 00:00
 * @returns {String} 时辰对应的中文
 */
export function hourPeriodsToString(time) {
  let periods = ["早子时", "丑时", "丑时", "寅时", "寅时", "卯时", "卯时", "辰时", "辰时", "巳时", "巳时", "午时", "午时", "未时", "未时", "申时", "申时", "酉时", "酉时", "戌时", "戌时", "亥时", "亥时", "子时"];
  let timeArr = time.split(":");
  let hour = parseInt(timeArr[0]);
  return periods[hour] || '未知时辰'
}

/**
 * @param {string} url
 * @returns {Object}
 */
 export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}
// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/').replace('T', ' ').replace(new RegExp(/\.[\d]{3}/gm), '');
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}
// 十神简称
export function shishenEllipsis(text) {
	if(!text)return "";
  if (text == '元男' || text == '元女') return text;
  if (text.includes("正官")) return '官';
  if (text.includes("七杀")) return '杀';
  if (text.includes("伤官")) return '伤';
  if (text.includes("正财")) return '财';
  if (text.includes("偏财")) return '才';
  if (text.includes("劫财")) return '劫';
  if (text.includes("正印")) return '印';
  if (text.includes("偏印")) return '枭';
  if (text.includes("比肩")) return '比';
  if (text.includes("食神")) return '食';
}

// 取消微信系统设置字体大小影响微信H5网页字体大小
export function fixWeixinFontsizeByWxOS() {
  if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
    handleFontSize();  
  } else {  
    if (document.addEventListener) {  
      document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);  
    } else if (document.attachEvent) {  
      document.attachEvent("WeixinJSBridgeReady", handleFontSize);  
      document.attachEvent("onWeixinJSBridgeReady", handleFontSize);    
    }  
  }  
  function handleFontSize() {  
    // 设置网页字体为默认大小  
    WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });  
    // 重写设置网页字体大小的事件  
    WeixinJSBridge.on('menu:setfont', function() {  
    WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });  
    });  
  }
}