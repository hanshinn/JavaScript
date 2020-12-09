# 数据类型转换

## 一、其他数据类型 => Number类型

### 1、特定转换为Number

- Number()
- parseInt()/parseFloat()

### 2、隐式转换

> 浏览器内部先转换为Number后进行运算处理

- isNaN()

- 数学运算

  > 如 1+2，990 + 8
  >
  > 特殊情况：加号两边都有内容，当加号一侧出现字符串时，此时就不是数学运算了，而是字符串拼接

- 在处理 == 比较时，部分值需要转化为数字后再进行比较（下面会提到）

- ......



```javascript
Number('') // => 0
Number('1') // => 1
Number('1x') // => NaN 只要出现非有效数字，结果都是NaN
Number(true) // => 1
Number(false) // => 0
Number(null) // => 0
Number(undefined) // => NaN
Number(Symbol(1)) // 报错：Uncaught TypeError: Cannot convert a Symbol value to a number
Number(BigInt(1)) // 1
Number({}) // NaN: 先valueOf，没有原始值，就toString变为字符串，最后再把字符串转换为数字
// [] => [] => '[object Object]' => NaN
```

> parseInt

[parseInt详解](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt)

```javascript
// parseInt(string, radix)  解析一个字符串并返回指定基数的十进制整数， radix 是2-36之间的整数，表示被解析字符串的基数。
// 
// 机制：把转换的值先转换为字符串，从字符串的左侧第一个字符开始，查找有效数字字符，遇到非有效数字字符时，停止查找，不论后面是否还有有效数字，都停止查找。把找到的有效数字字符转换为数字。
// 如果一个都没找到，则结果为 NaN
// 例：
[10.18, 0, 10, 25, 23].map(parseInt) // => [10, NaN, 2, 2, 11]
// => [10.18, 0, 10, 25, 23].map((item, index) => parseInt(item, index))
// => parseInt(10.18, 0) => 10
// => parseInt(0, 1) => NaN
// => parseInt(10, 2) => 2
// => parseInt(25, 3) => 2
// => parseInt(23, 4) => 11
```

> parseFloat

```javascript
// 比 parseInt 多识别一个小数点
```

```javascript
// 示例：
parseInt('') // => NaN
Number('') // => 0
isNaN('') // => false ( isNaN('') => isNaN(Number('')) => isNaN(0) => false )
parseInt(null) // => NaN ( parseInt(null) => parseInt('null') )
Number(null) // => 0
isNaN(null) // => false
parseInt('1a') // => 1
Number('1a') // => NaN
isNaN('1a') // => true

parseFloat('1.6a') + parseInt('1.6a') + typeof parseInt(null) // => '2.6Number'
// => 1.6 + 1 + typeof NaN => 2.6 + 'Number' => '2.6Number'

isNaN(Number(!!Number(parseInt('0.8')))) // => false
// => isNaN(Number(!!Number(0))) => isNaN(Number(!!0)) => isNaN(Number(false)) => isNaN(0) => false

typeOf !parseInt(null) + !isNaN(null) // => 'booleantrue'
// => typeof !NaN + !isNaN(0) => typeof true + !false => 'boolean' + true => 'booleantrue'

10 + false + undefined + [] + 'aaa' + null + true + {}
// => 10 + Number(false) + undefined + [] + 'aaa' + null + true + {}
// => 10 + 0 + undefined + [] + 'aaa' + null + true + {}
// => 10 + undefined + [] + 'aaa' + null + true + {}
// => 10 + Number(undefined) + [] + 'aaa' + null + true + {}
// => 10 + NaN + [] + 'aaa' + null + true + {}
// => NaN + [] + 'aaa' + null + true + {}
// => NaN + [].toString() + 'aaa' + null + true + {}
// => NaN + '' + 'aaa' + null + true + {}
// => 'NaN' + 'aaa' + null + true + {}
// => 'NaNaaa' + null + true + {}
// => 'NaNaaa' + 'null' + true + {}
// => 'NaNaaanull' + true + {}
// => 'NaNaaanull' + 'true' + {}
// => 'NaNaaanulltrue' + {}
// => 'NaNaaanulltrue' + ({}).toString()
// => 'NaNaaanulltrue' + '[object Object]'
// => 'NaNaaanulltrue[object Object]'
```

> 其他

```javascript
// 加号一侧出现字符串不一定是字符串拼接，如
i++/++i/+i
// ++('1') => 2

// 代码块识别
{} + 0 // => 0: 左边的{}认为是一个代码块，不参与运算，只处理 +0 （function fn() {} + 0）

({}+0) // => '[object Object]0': 参与到数学计算中
0 + {} // => '0[object Object]': 参与到数学计算中
```



## 二、其他数据类型 => 字符串

### 1、可使用转换为字符串的方法

- String()
- toString()

### 2、隐式转换

> 一般情况下都是调用toString

- 在加号运算的时候，如果一侧出现字符串的时候，处理为字符串拼接
- 把对象转换为数字的时候，会先toString()转换为字符串，再去转换为数字
- alert/confirm/prompt/document.write...这些方式在输出内容的时候，会把内容转化为字符串，然后再输出
- ......

......

```javascript
// {} 普通对象 调取toString是调取的Object.prototype.toString，不是转换为字符串，而是检测数据类型，结果是'[object Object]'
// 其他值 转换为字符串时，一般直接使用 '' 包起来
```



 ## 三、其他数据类型 => 布尔类型

### 1、可使用转换为布尔类型的方法

- ! => 转换为布尔类型后取反
- !! => 转换为布尔类型
- Boolean()

### 2、隐式转换

- 在条件判断中，条件处理的结果就是布尔类型
- ......

```javascript
规则：只有" 0, NaN, null, undefined, '' " 这五个值会变为布尔的 false，其余的都是 true
```



----



## == 比较过程中的转换规则

### 数据类型相同

- {} == {}：false  （对象比较的是堆内存的地址，地址不同）
- [] == [] : false （对象比较的是堆内存的地址，地址不同）
- NaN == NaN: false

### 数据类型不同

- null == undefined: true

  > 如果换成 === ，则为false，他们的类型不同
  >
  > 其余的 null/undefined 和其他任何数据类型的值都不相等

- 字符串 == 对象：要把对象转换为字符串后再作比较

- 其他的，如果 == 两边类型不一致，则需要转换为数字后再进行比较



```javascript
// 一、
[] == false // true
/**
 * 对象 == 布尔类型
 * 1、两边转换为数字
 * 2、对象转换为数字：先基于valueOf获得原始值，没有原始值，再去toString，然后再转换为数字
 *    [] => [] => '' => 0
 *    false => 0
 */
// 二、
![] == false // true
/**
 * ![] => 先把数组转化为布尔类型，然后取反 => !true => false
 * false == false => true
 */
```

















