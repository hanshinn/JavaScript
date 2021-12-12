# JavaScript数据类型检测



## JavaScript中创建一个值的两种方案

### 1、字面量方式

```javascript
let a = 1;
let obj = {};
...
```



### 2、构造函数方式

> 不能 new Symbol 和 new BigInt，可以通过Object(Symbol()/BigInt())，其他基本类型(除null和undefined)也可以这样做

```javascript
let a = new Number(1)
let obj = new Object()
...
```

![image-20201121161433720](C:\Users\19234\Desktop\image-20201121161433720.png)

**对于基本数据类型，两种方式的结果不同**

> **字面量方式**得到的是基本数据类型（特殊的实例）
>
> 通过**构造函数方式**的得到的是对象类型（这才是一个正规的实例，基于`__proto__`找到所属类原型，`valueOf` 获取原始值）

> 字面量方式下，也可以调用`a.toFixed(2)`，是因为它自己会先转换为标准的实例`new Number`出来的结果，然后再去调用原型上的方法。**但是`1.toFixed(2)`不行，`(1).toFixed(2)`可以**

**对于引用数据类型，两种方式处理语法上的一些区别，没有本质的区别，获取的都是对应类的实例对象**



## JavaScript检测数据类型的方法

### 1、typeof

> typeof [value]

- 好处：简单方便，大部分数据类型都可以检测

- 缺点：typeof null => "object"

  这是JS的设计缺陷：数据值都是按照二进制存储的。

  > 默认1开头的是整数，010开头的是浮点数，100开头的是字符串，110开头的是布尔，000开头的是对象，-2^30undefined，000000null 也说明typeof是按照二进制存储值进行检测的

typeof不能细分**具体的对象数据类型值**，所有的对象数据类型值，检测出来的结果都是"object"

typeof检测**基于构造函数**创建出来的，基本数据类型的实例对象，结果也是"object"

```javascript
console.log(typeof 1);            // => number
console.log(typeof 1.1);          // => number
console.log(typeof '1');          // => string
console.log(typeof true);         // => boolean
console.log(typeof Symbol());     // => symbol
console.log(typeof BigInt(1));    // => bigint
console.log(typeof function(){}); // => function
console.log(typeof [1, 2]);       // => object
console.log(typeof { a: 1 });     // => object

console.log(typeof new Number(1));    // => object
console.log(typeof new Number(1.1));  // => object
console.log(typeof new Boolean(true));// => object
console.log(typeof new Boolean(1));   // => object
console.log(typeof new String(1));    // => object
console.log(typeof new String('1'));  // => object
console.log(typeof new Object(1));    // => object
console.log(typeof new Object());     // => object
console.log(typeof Object(Symbol(1)));// => object
console.log(typeof Object(BigInt(1)));// => object
console.log(typeof new Function());   // => function
let Fn = function () {}
console.log(typeof Fn);               // => function
console.log(typeof new Fn());         // => object
```



### 2、instanceof

> 检测某个实例是否属于这个类。基于instanceof可以细分一下不同类型的对象，也可以检测出基于构造函数方式创建出来的基本类型对象值

- 原理：instanceof基于构造函数`[Symbol.hasInstance](实例)`。检测当前构造函数的原型prototype是否出现在，当前实例所处的原型链上，如果能出现，结果就是true，否则就是false

- 缺陷：在JS中的原型链是可以改动的，所以结果不准确。所有实例的原型链最后都指向Object.prototype，所有 “实例 instanceof Object” 的结果都是`true`。

  **字面量方式**创造的基本数据类型值是无法给予instanceof检测的，浏览器默认并不会把它转换为new的方式，所以它本身不是对象，不存在`__proto__`

```javascript
let a = 1;
// 原因：基本数据类型不是对象，不存在__proto__
console.log(a instanceof Number); // => false
// -----------------------------------------------------------------
let b = [1, 2];
console.log(b instanceof Array);  // => true
console.log(b instanceof Object); // => true
// -----------------------------------------------------------------
let c = {
  0: 1,
  1: 2,
  length: 2
}
console.log(c instanceof Array);  // => false
console.log(c instanceof Object); // => true
// -----------------------------------------------------------------
let d = {
  a: 1,
  b: 2
}
console.log(d instanceof Array);  // => false
console.log(d instanceof Object); // => true
// -----------------------------------------------------------------
function Fn () {}
let fn = new Fn;
console.log(fn instanceof Array);  // => false
// 原型链可以改动，所以结果也不准确
Fn.prototype = Array.prototype;
let fn1 = new Fn;
// fn1是函数而不是数组，所以原型链改动后，结果就不准确了
console.log(fn1 instanceof Array); // => true
```



### 3、constructor

> 检查直属类是谁

> 注：constructor是可以肆意被修改，所以也不准确

```javascript
let a = 1;
// 浏览器会默认把 a 转换为 new Number，所以也可以用
console.log(a.constructor === Number);  // => true
a = new Number(1);
console.log(a.constructor === Number);  // => true
// -----------------------------------------------------------------
let b = [1, 2];
console.log(b.constructor === Array);   // => true
console.log(b.constructor === Object);  // => false
// -----------------------------------------------------------------
let c = {
  0: 1,
  1: 2,
  length: 2
}
console.log(c.constructor === Array);   // => false
console.log(c.constructor === Object);  // => true
```

### 4、Object.prototype.toString.call

> Object.prototype.toString.call([value])

**这是一个万全之策。** *（除了代码略长）*

- 原理：大部分内置类的原型是都有**toString()**，但是一般都是转换为字符串，只有Object.prototype上的toString()并不是转换为字符串，而是返回**当前实例对象所属类**的信息的**'[object 所属构造函数的信息]'**

所属构造函数的信息是根据**Symbol.toStringTag**这个属性获取的，有这个属性基于这个获取，没有的浏览器自己计算。

```javascript
// 用call是改变this指向，使用Object原型上的toString方法(鸭子类型)[原型上方法的借用]
// 也可以这样写：({}).toString.call([value])
let a = 1;
console.log(Object.prototype.toString.call(a)); // => [object Number]
a = new Number(1);
console.log(Object.prototype.toString.call(a)); // => [object Number]
// -----------------------------------------------------------------
let b = [1, 2];
console.log(Object.prototype.toString.call(b)); // => [object Array]
// -----------------------------------------------------------------
let c = {
  0: 1,
  1: 2,
  length: 2
}
console.log(Object.prototype.toString.call(c)); // => [object Object]
// -----------------------------------------------------------------
let d = {
  a: 1,
  b: 2
}
console.log(Object.prototype.toString.call(d)); // => [object Object]
// -----------------------------------------------------------------
let Fn = function () {}
console.log(Object.prototype.toString.call(Fn)); // => [object Function]
let fn = new Fn;
console.log(Object.prototype.toString.call(fn)); // => [object Object]
```

可以简写为下面这种方式：

```javascript
let type = {};
let toString = type.toString; // => Object.prototype.toString
console.log(toString.call(1));              // => [object Number]
console.log(toString.call(new Number(1)));  // => [object Number]
console.log(toString.call('1'));            // => [object String]
console.log(toString.call(true));           // => [object Boolean]
console.log(toString.call(null));           // => [object Null]
console.log(toString.call(undefined));      // => [object Undefined]
console.log(toString.call([1, 2]));         // => [object Array]
console.log(toString.call(/^\d+$/));        // => [object RegExp]
console.log(toString.call({}));             // => [object Object]
console.log(toString.call(function () {})); // => [object Function]
```

**关于Symbol.toStringTag这个属性**

```javascript
function Fn () {}
Fn.prototype[Symbol.toStringTag] = 'Fn';
let fn = new Fn;
console.log(Object.prototype.toString.call(fn)); // => [object Fn]
```

### 5、数组检测的其他方式

#### Array.isArray

```javascript
let a = [];
console.log(Array.isArray([])); // => true
```

#### 其他

```javascript
// 基于正则
// 这样写代码太长
console.log(/array/i.test(Object.prototype.toString.call([]))); // => true
```



## jQuery源码中的数据检测代码分析及部分重写

> 这些方法可以直接引入到项目中使用。

```javascript
var class2type = {};
var toString = class2type.toString;     // Object.prototype.toString 检测数据类型
var hasOwn = class2type.hasOwnProperty; // Object.prototype.hasOwnProperty 检测是否是私有属性
var fnToString = hasOwn.toString;       // Function.prototype.toString 把函数转换为字符串
var ObjectFunctionString = fnToString.call(Object);
// => "function Object() { [native code] }"
var getProto = Object.getPrototypeOf;   // 获取当前对象的原型链__proto__

// 检测是否为函数
var isFunction = function isFunction(obj) {
  // typeof obj.nodeType !== "number"：防止在部分浏览器中，检测<object>元素对象结果也是"function"，但是它的nodeType是1，处理浏览器兼容问题
  // 元素节点(DOM对象)具备nodeType，值是1
  // 所有的DOM节点具备nodeType。元素：1，文本：3，注释：8，document：9
  return typeof obj === "function" && typeof obj.nodeType !== "number";
};

// 检测是否为window对象
var isWindow = function isWindow(obj) {
  // window对象有个特点：window上有个属性是window
  // window.window === window （符合这个条件的就是window对象）
  return obj != null && obj === obj.window;
};

// 检测数据类型的方法
var toType = function toType(obj) {
  if (obj == null) {
    // 传递的null或者undefined或者null，直接返回字符串'undefined'或者'null'
    return obj + "";
  }
  // 基于字面量方式创造的基本数据类型，直接基于typeof检测类型即可（性能会好一些）(function也可以走typeof)
  // 剩余的基于Object.prototyp.toString.call的方式来检测：格式 "[object xxx]"->对应到class2type映射表直接拿到对应数据类型字符串
  return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
}

/**
jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),
function (_i, name) {
  class2type["[object " + name + "]"] = name.toLowerCase();
});
*/
// 建立数据类型检测映射表（jq源码是上面这样实现的）
// class2type: { [object Array]: "array", [object Boolean]: "boolean", ... }
var mapType = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error", "Symbol", "BigInt"];
mapType.forEach(function (name) {
  class2type["[object " + name + "]"] = name.toLowerCase();
});

// 检测是否为数组或者类数组
var isArrayLike = function isArrayLike(obj) {
  // length存储的是对象的length属性值或者是false
  // type存储的是检测的数据类型
  var length = !!obj && "length" in obj && obj.length, type = toType(obj);
  // 一定不是数组或类数组。window.length = 0 && Function.prototype.length = 0，需要排除掉
  if (isFunction(obj) || isWindow(obj)) { return false; }
  // type === "array"：是数组
  // length === 0：是空的类数组
  // typeof length === "number" && length > 0 && (length - 1) in obj：如果有length属性并且是一个数字且不是空的类数组，并且索引是按序增长的(最大索引在对象中)
  return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
}

// 检测是否为纯粹的对象，如{}
// 实例对象不是纯粹的对象
var isPlainObject = function isPlainObject (obj) {
  var proto, Ctor;
  // 如果不存在 或者 基于toString检测的结果不是"[object Object]"，一定不是纯对象
  if (!obj || toString.call(obj) !== "[object Object]") {
    return false;
  }
  // 获取当前值的原型链(直属类的原型链)
  proto = getProto(obj);
  // Object.create(null)：这样创造的对象没有__proto__
  if (!proto) return true;
  // Ctor存储原型对象上的constructor这个属性，没有这个属性就是false
  Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
  // 条件成立说明原型上的构造函数是Object：当前对象就是Object的一个实例，并且obj.__proto__ === Object.prototype
  return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
}

// 检测是否为空对象
var isEmptyObject = function isEmptyObject (obj) {
  /**
   * jQ实现的方式(但这种for...in...的方式不太好)：
   *  var name;
      for (name in obj) { return false; }
      return true;
   */
  // obj是undefined或者null，排除掉
  if (obj == null) { return false; }
  // 基于typeof检测不是object，不是对象类型
  if (typeof obj !== "object") { return false }
  // 是一个对象（纯粹但这或者特殊对象）
  var keys = Object.keys(obj); // Object.keys()[IE6,7,8不兼容] -> 拿到的私有的属性，symbol拿不到
  if (hasOwn.call(Object, 'getOwnPropertySymbols')) { // getOwnPropertySymbols兼容性差，看看Object有没有这个属性
    // 兼容这个属性的情况下，再去拼接
    keys = keys.concat(Object.getOwnPropertySymbols(obj));
  }
  return keys === 0;
}

// 检测是否为数字
var isNumeric = function isNumeric (obj) {
  var type = jQuery.type(obj);
  // 如果不是数字或者字符串，一定不是数字
  // 如果是字符串，需要处理：用之前的值与浮点型进行数学计算，如果结果是NaN，那就不是数字
  // 排除16进制数字
  // return (type === "number" || type === "string") && !isNaN(obj - parseFloat(obj)); // => 【jq实现的方式】
  return (type === "number" || type === "string") && !isNaN(+obj);
}
```

