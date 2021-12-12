# 变量提升

## 一、什么是变量提升

> 在javascript中，函数及变量的声明都将会提升到最顶部（这个过程操作可以认为是在代码编译之后、执行之前进行）
>
> 注意：只是 var 和 function 才会被提升

### 一）var 与 function 的变量提升

#### 例一

```javascript
// ***********************例一***********************
console.log(a);
var a = 10;
console.log(a);
// 打印结果如下：
undefined
10
// 解析：
// 1、在这一个代码块执行前，会首先做一次变量提升
// 2、当在第二行发现 var a = 10 时，会对 a 做变量提升，对 a 进行声明（注意：仅仅是声明，没有定义或赋值，即只进行了var a 的操作）
// 3、继续向下，结束后发现已经没有需要变量提升的了
// 4、执行代码
// 5、执行到第一行时，a已经声明，所以不会报错，但是此时a并没有赋值，所以 a 此时是undefined
// 6、执行到第二行时，a已经声明，不需要重新声明，赋值 a = 10 即可，此时 a = 10
// 7、执行到第三行时，a 已经赋值为 10，所以打印 10
// 8、代码执行结束
```

#### 例二

```javascript
console.log(a);
function a () {}
console.log(a);
// 打印结果如下：
function a () {}
function a () {}
// 解析：
// 与 var 不同的是，function 会将声明和赋值同时进行，所以第一次并不会打印 undefined。区别可以看下一个例子
```

#### 例三

```javascript
console.log(a);
var a = function a () {}
console.log(a);
// 打印结果如下：
undefined
function a () {}
// 与例二不同的是，例二是函数声明，而例三是函数表达式。
// JavaScript中的函数表达式没有提升,不像函数声明,你在定义函数表达式之前不能使用函数表达式，如下
a() // 报错：Uncaught TypeError: a is not a function
var a = function a () { console.log('function') }
-------------------
a() // 打印'function'
function a () { console.log('function') }
```



>  **JavaScript中的函数表达式没有提升，不像函数声明，你在定义函数表达式之前不能使用函数表达式**



### 二）let、const是否存在变量提升

那么，let、const 是否有同样的问题呢？其他的声明方式呢？

首先，先看几个简单的例子：

#### 例一

```javascript
console.log(a) // 报错:Uncaught ReferenceError: Cannot access 'a' before initialization
let a = 10;
console.log(a)
// 报错不能在初始化之前访问a，所以 let 是不存在变量提升的

console.log(a) // 报错:Uncaught ReferenceError: Cannot access 'a' before initialization
const a = 10;
console.log(a)
// 报错不能在初始化之前访问a，所以 const 也是不存在变量提升的
```

**let** 语句声明一个块级作用域的本地变量，并且可选的将其初始化为一个值。

与通过  `var` 声明的有初始化值 `undefined` 的变量不同，通过 `let` 声明的变量直到它们的定义被执行时才初始化。在变量初始化前访问该变量会导致 `ReferenceError`。该变量处在一个自块顶部到初始化处理的“暂存死区”中。



## 二、严格模式

> "use strict"

```javascript
a = 0; // 给GO设置一个属性a -> window.a=0
console.log(a)
// 会打印出 0

"use strict"
a = 0;
console.log(a)
// 而严格模式下，会报错：Uncaught ReferenceError: x is not defined
```

![image-20201117202021130](C:\Users\19234\AppData\Roaming\Typora\typora-user-images\image-20201117202021130.png)



```javascript
// VO(G):全局变量对象「全局上下文中声明的变量」
// GO「window」:全局对象 「浏览器默认开辟的一个堆内存，存储供JS调用的各种API的」
// console.log(a);
// 首先看VO(G)中是否有，如果没有，则再看GO中有没有，如果也没有，则报错：a is not defined 
```



> 老版本机制：VO(G)<全局变量对象>中声明一个a的全局变量，赋值0；特殊：“全局上下文”中，“基于var/function声明”的变量，也相当于给GO<全局变量对象>新增私有属性；并且之间存在映射关系「一个修改，另外一个也跟着修改」；

> 新版本机制：“全局上下文”中，“基于var/function声明”的变量，直接都当做GO<全局变量对象>的属性存储起来；

> 基于let/const声明的变量，只是给VO(G)中设置全局变量，和GO没有任何的关系；



```javascript
console.log(a) // Uncaught ReferenceError: a is not defined
a = 10

// 这里没有变量提升
// 先看VO(G)中是否有，没有再看GO中是否有，也没有 Uncaught ReferenceError: a is not defined
```

