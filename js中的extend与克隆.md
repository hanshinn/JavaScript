```javascript
// 1、方法扩展
// 2、基于浅比较和深比较实现对象的合并
var extend = function extend (obj) {
  // 如果不使用obj形参，也可以使用arguments[0]
  // 是undefined或者null，或者类型检测不是一个对象，抛出一个异常
  if (obj == null || typeof obj !== 'object') {
    throw new TypeError('obj must be an object')
  }
  var self = this;
  var keys = Object.keys(obj); // 获取所有的不包含symbol的私有属性
  // 看浏览器是否兼容Symbol
  typeof Symbol !== "undefined" ? keys = keys.concat(Object.getOwnPropertySymbols(obj)) : null;
  keys.forEach(function (key) {
    self[key] = obj[key];
  })
  return self;
}


/**
 * 实现对象的浅合并
 * 合并的规律：
 *  1、obj1、obj2都是对象：迭代obj2，依次替换obj1
 *  2、obj1不是对象，obj2是对象：obj2替换obj1
 *  3、obj1是对象，obj2不是对象：以obj1为主
 *  4、obj1、obj2都不是对象：obj2替换obj1
 */
var shallowMerge = function shallowMerge (obj1, obj2) {
  var isPlain1 = isPlainObject(obj1),
      isPlain2 = isPlainObject(obj2);
  // obj1不是对象：obj2替换obj1
  if (!isPlain1) return obj2;
  // obj1是对象，obj2不是对象：以obj1为主
  if (!isPlain2) return obj1;
  // obj1、obj2都是对象：迭代obj2，依次替换obj1
  each(obj2, function (key, value) {
    obj1[key] = value;
  })
  return obj1;
}

/**
 * 深合并
 */
var deepMerge = function deepMerge (obj1, obj2, cache) {
  // 防止死递归(如果对象自身有一个属性是自己本身，就会出现死递归)，处理过了就不要再处理了
  cache = !Array.isArray(cache) ? [] : cache;
  if (cache.indexOf(obj2) !== -1) return obj2;
  cache.push(obj2);
  // 正常处理逻辑
  var isPlain1 = isPlainObject(obj1),
      isPlain2 = isPlainObject(obj2);
  // 如果有一个不是对象，浅合并就行
  if (!isPlain1 || !isPlain2) return shallowMerge(obj1, obj2);
  // 如果都是对象，递归即可
  each(obj2, function (key, value) {
    obj1[key] = deepMerge(obj1[key], value, cache);
  })
  return obj1;
}

/**
 * 对象或者数组克隆（但这都是浅克隆）
 * 1、... [扩展运算符]
 * 2、迭代
 * 3、内置方法：slice等
 * 问题：只处理对象或者数组的第一级内容（只有第一级copy一份，剩下的级别都是公用的，这样克隆的结果还是与之前还是有一定关联的）
 * JSON.parse(JSON.stringfy())：深克隆[会先转化为字符串，再转化为对象，所有的内存重新开辟]
 * - 转换为字符串的时候，不是所有的值都支持
 * - 正则会变为空对象
 * - BigInt处理不了，会报错
 * - 属性值为undefined或者函数的都会丢失
 * - new Date 日期对象会变为字符串，JSON.parse无法再转换为对象
 * - ArrayBuffer也会出现类似问题
 */

/**
 * 浅克隆
 */
var shallowClone = function shallowClone (obj) {
  var type = toType(obj),
      Ctor = null;
  // 其他特殊值的处理
  if (obj == null) return obj;
  Ctor = obj.constructor;
  // 正则的克隆，lastIndex会初始化为0
  if (/^(regexp|date)$/i.test(type)) return new Ctor(obj);
  if (/^(symbol|bigint)$/i.test(type)) return Object(obj);
  if (/^error$/i.test(type)) return new Ctor(obj.message);
  if (/^function$/i.test(type)) {
    // 函数克隆利用闭包的机制
    return function anonymous () {
      return obj.apply(this, arguments);
    }
  }
  // 数组或者对象，基于循环的方案处理
  if (isPlainObject(obj) || type === 'array') {
    var result = new Ctor();
    each(obj, function (key, value) {
      result[key] = value;
    })
    return result;
  }
  return obj;
}

/**
 * 深克隆
 */
var deepClone = function deepClone (obj, cache) {
  var type = toType(obj),
      Ctor = null,
      result = null;
  // 不是数组或者对象，直接浅克隆
  if (!isPlainObject(obj) && type !== 'array') return shallowClone(obj);
  // 避免死递归
  cache = !Array.isArray(cache) ? [] : cache;
  if (cache.indexOf(obj) === -1) return obj;
  cache.push(obj);
  Ctor = obj.constructor;
  result = new Ctor();
  each(obj, function (key, value) {
    result[key] = deepClone(value, cache);
  })
  return result;
}
```

