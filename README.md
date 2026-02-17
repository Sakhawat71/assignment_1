
**live link** : https://assignment1-sakhawat.netlify.app/

---

### 1) What is the difference between `null` and `undefined`?

**`undefined`** মানে হলো একটি ভেরিয়েবল ডিক্লেয়ার করা হয়েছে, কিন্তু তাকে এখনো কোনো মান দেওয়া হয়নি। জাভাস্ক্রিপ্ট নিজে থেকেই এই ডিফল্ট মানটি বসিয়ে দেয়।

```js
let name;
console.log(name);
```

**`null`** মানে হলো ইচ্ছাকৃতভাবে একটি ভেরিয়েবলকে "কোনো মান নেই" বা "খালি" বলে চিহ্নিত করা। এটি প্রোগ্রামার নিজে সেট করেন।

```js
let user = null;
```

**মূল পার্থক্য:**

| বিষয় | `undefined` | `null` |
|------|------------|--------|
| কে সেট করে? | জাভাস্ক্রিপ্ট (অটোমেটিক) | প্রোগ্রামার (ইচ্ছাকৃত) |
| টাইপ | `"undefined"` | `"object"` (এটি একটি বাগ) |
| অর্থ | মান দেওয়া হয়নি | ইচ্ছাকৃতভাবে মান নেই |
| `==` তুলনা | `null == undefined` → `true` | `null == undefined` → `true` |
| `===` তুলনা | `null === undefined` → `false` | `null === undefined` → `false` |

---

### 2) What is the use of the `map()` function in JavaScript? How is it different from `forEach()`?


**`map()`** একটি অ্যারের প্রতিটি উপাদানের উপর একটি ফাংশন চালায় এবং একটি **নতুন অ্যারে** রিটার্ন করে। মূল অ্যারে পরিবর্তন হয় না।

```js
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8]
console.log(numbers); // [1, 2, 3, 4]
```

**`forEach()`** একটি অ্যারের প্রতিটি উপাদারের উপর ফাংশন চালায়, কিন্তু **কিছু রিটার্ন করে না** (returns `undefined`)। এটি মূলত সাইড ইফেক্টের জন্য ব্যবহার করা হয়।

```js
const numbers = [1, 2, 3];
numbers.forEach(num => console.log(num)); // 1, 2, 3
```

**মূল পার্থক্য:**

| বিষয় | `map()` | `forEach()` |
|------|--------|-------------|
| রিটার্ন ভ্যালু | নতুন অ্যারে | `undefined` |
| ব্যবহার | ট্রান্সফর্মেশন (নতুন ডেটা তৈরি) | সাইড ইফেক্ট (লগ, DOM আপডেট) |
| চেইনিং | সম্ভব (`.map().filter()`) | সম্ভব নয় |

---

### 3) What is the difference between `==` and `===`?


**`==`** হলো **Loose Equality Operator** বা **Abstract Equality Operator**। এটি তুলনার সময় টাইপ কনভার্শন (type coercion) করে নেয়, অর্থাৎ দুটি ভিন্ন টাইপের মান তুলনা করার আগে একই টাইপে রূপান্তর করে।

```js
console.log(5 == "5");   // true  
console.log(0 == false); // true  
console.log(null == undefined); // true
```

**`===`** হলো **Strict Equality Operator**। এটি **কোনো টাইপ কনভার্শন করে না**। মান এবং টাইপ উভয়ই একই হতে হবে।

```js
console.log(5 === "5");   // false 
console.log(0 === false); // false 
console.log(5 === 5);     // true  
```

**সাধারণ পরামর্শ:** সবসময় `===` ব্যবহার করা উচিত, কারণ এটি অনাকাঙ্ক্ষিত বাগ প্রতিরোধ করে।

---

### 4) What is the significance of `async`/`await` in fetching API data?

জাভাস্ক্রিপ্ট একটি **single-threaded** ভাষা। API কল একটি **asynchronous** অপারেশন — এটি সময় নেয় এবং সাথে সাথে ফলাফল পাওয়া যায় না।

**`async`/`await` ছাড়া (Callback/Promise চেইন):**
```js
fetch('https://fakestoreapi.com/products')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```
এই পদ্ধতি জটিল হয়ে যায় এবং "Callback Hell" তৈরি হতে পারে।

**`async`/`await` দিয়ে:**
```js
async function fetchProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**`async`/`await`-এর গুরুত্ব:**

- কোড **সিঙ্ক্রোনাসের মতো পড়তে** সহজ হয়, যদিও এটি আসলে অ্যাসিঙ্ক্রোনাস
- `await` কীওয়ার্ড Promise রেজোলিউশনের জন্য অপেক্ষা করে
- `try-catch` দিয়ে সহজে **এরর হ্যান্ডলিং** করা যায়
- কোড ডিবাগ করা সহজ হয়
- **Callback Hell** বা লম্বা `.then()` চেইন এড়ানো যায়

---

### 5) Explain the concept of Scope in JavaScript (Global, Function, Block).

**Scope** হলো কোডের একটি নির্দিষ্ট অংশ যেখানে একটি ভেরিয়েবল **অ্যাক্সেসযোগ্য** বা **দৃশ্যমান**।

---

**১. Global Scope (গ্লোবাল স্কোপ)**

যে ভেরিয়েবল কোনো ফাংশন বা ব্লকের বাইরে ডিক্লেয়ার করা হয়, সেটি গ্লোবাল স্কোপে থাকে। প্রোগ্রামের যেকোনো জায়গা থেকে এটি অ্যাক্সেস করা যায়।

```js
const siteName = "SwiftCart"; // গ্লোবাল স্কোপ

function greet() {
  console.log(siteName); // এখানেও অ্যাক্সেস করা যাচ্ছে
}
greet();
```

---

**২. Function Scope (ফাংশন স্কোপ)**

`var`, `let`, বা `const` দিয়ে কোনো ফাংশনের ভেতরে ডিক্লেয়ার করা ভেরিয়েবল শুধুমাত্র সেই ফাংশনের মধ্যেই অ্যাক্সেসযোগ্য। বাইরে থেকে অ্যাক্সেস করলে এরর আসবে।

```js
function calculatePrice() {
  const price = 99.99; // ফাংশন স্কোপ
  console.log(price);  // কাজ করবে
}
calculatePrice();
console.log(price); // ❌ ReferenceError: price is not defined
```

---

**৩. Block Scope (ব্লক স্কোপ)**

`{}` কার্লি ব্র্যাকেটের মধ্যে `let` বা `const` দিয়ে ডিক্লেয়ার করা ভেরিয়েবল শুধুমাত্র সেই ব্লকের মধ্যেই অ্যাক্সেসযোগ্য। (if, for, while ইত্যাদির ব্লক)

```js
if (true) {
  let blockVar = "আমি ব্লকের ভেতরে"; // ব্লক স্কোপ
  console.log(blockVar); //  কাজ করবে
}
console.log(blockVar); //  ReferenceError

// var ব্লক স্কোপ মানে না:
if (true) {
  var globalVar = "আমি var দিয়ে"; // ফাংশন বা গ্লোবাল স্কোপে চলে যায়
}
console.log(globalVar); //  এটি কাজ করবে (var-এর ক্ষেত্রে)
```

**সংক্ষেপে:**
- **Global** → সর্বত্র অ্যাক্সেস করা যায়
- **Function** → শুধু সেই ফাংশনের মধ্যে
- **Block** → শুধু `{}` ব্লকের মধ্যে (`let`/`const`-এর ক্ষেত্রে)

---
