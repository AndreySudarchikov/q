# 𝚀.𝚓𝚜 — 𝚃𝚑𝚎 𝚄𝚕𝚝𝚒𝚖𝚊𝚝𝚎 𝙼𝚒𝚌𝚛𝚘-𝚂𝚞𝚐𝚊𝚛 𝙴𝚗𝚐𝚒𝚗𝚎 ⚡️

**Q.js** is a high-performance JavaScript micro-sugar library (approx. 4KB) designed to bridge the gap between Vanilla JS and developer comfort. It’s a **battle-tested selector wrapper** refined over 4+ years of real-world development in dynamic web apps.

---

## 💎 The Core Philosophy: "Smart Collections"

The heart of **Q.js** is the **Selector Wrapper**. Unlike bulky frameworks, `Q` returns a `QueryArray`—a specialized object that **inherits directly from the native `Array`**.

* **Everything is a Collection:** `Q(selector)` works like `querySelectorAll`, but instead of a static NodeList, it returns a `QueryArray` full of live elements.
* **Pipeline Selection:** While `.find()` might look like a complex CSS selector (e.g., `.parent .child`), **Q.js** gives you control at every step. You can filter, modify, or inspect the parent collection *before* diving into its children.
* **Zero Selector Overhead:** `Q.js` relies exclusively on **standard CSS selectors**. It uses the browser's native engine for maximum execution speed.
* **Fluent DOM Control:** Chain CSS manipulations, attribute changes, and event listeners in a single, readable flow.

---

## 🚀 Key Features

### 1. Step-by-Step Traversal (Control the Flow)
Don't just select elements—process them. `Q` allows you to intercept the selection at any stage:
```javascript
// Unlike a static '.menu .item' selector, here you control the middle step:
Q('.menu')
  .filter(menu => menu.isVisible()) // Custom logic on parents
  .classAdd('processed')            // Modify parents
  .find('.item')                    // Now get the children
  .classAdd('active');              // Modify children
 ```

### 2. Q.dcall (The Named Debouncer)
The "killer feature" for performance. Synchronize hundreds of rapid events (like MutationObserver triggers) into a single atomic execution by name. No matter how many times an event fires, the callback runs once after a specified pause.
```javascript
Q.on('data-updated', () => {
    Q.dcall('uiSync', 50, () => {
        console.log('Heavy UI synchronization logic executed exactly once.');
        Q('.status-indicator').classAdd('updated');
    });
});
```


### 3. Declarative UI Construction
Build complex DOM trees with a clean, functional syntax using `Q.create`.
```javascript
Q.create('div', { class: 'modal-wrapper' })
  .append(
    Q.create('div', { class: 'modal-content' })
      .append(Q.create('h2').html('Welcome'))
      .append(Q.create('p').html('This element was created using micro-sugar chaining.'))
      .append(
        Q.create('button', { class: 'btn-close' })
          .html('Got it!')
          .on('click', (e) => Q(e.target).closest('.modal-wrapper').remove())
      )
  )
  .appendTo(document.body);
```



### 4. Built-in Asset & SVG Caching
Optimized for speed. `Q.js` handles resource fetching, caching, and DOM insertion internally. You can either inject directly or handle the data yourself.
```javascript
// Option A: Direct Injection (The "Fast Sugar" way)
// Fetches once, clones, and injects into all matched elements.
Q('.icon-placeholder').loadSvg('assets/icons/star.svg');

// Option B: Manual Control (The "Flexible" way)
// Use a callback to handle the loaded SVG node manually.
Q.loadSvg('assets/icons/star.svg', (svgNode) => {
    console.log('SVG Loaded:', svgNode);
    Q('#custom-target').append(svgNode);
});
```

---

## ⚡️ API Cheat Sheet

### **Selection & Traversal**
* `Q(selector)` — The core wrapper. Returns a `QueryArray`.
* `.find(selector)` — Search descendants.
* `.parent()` / `.closest(selector)` — Navigate up the tree.

### **Manipulation**
* `.html(val)` / `.text(val)` — Get or set content.
* `.attr(name, val)` / `.removeAttr(name)` — Toggle attributes.
* `.classAdd(name)` / `.classRem(name)` / `.classToggle(name)` — Manage classes.
* `.css(prop, val)` — Style elements on the fly.

### **Events & Logic**
* `.on(event, callback)` / `.off(event)` — Standard event listeners.
* `Q.dispatch(name, detail)` — Fire custom global events.
* `Q.dcall(name, delay, callback)` — **The Execution Controller.**
* `Q.create(tag, options)` — Declarative element factory.

---

## 📜 Battle-Tested
This library has been continuously optimized and maintained. It is designed for environments where predictability, memory efficiency, and speed are non-negotiable.

---

## License
**MIT** — Open for everyone.

Enjoy!
