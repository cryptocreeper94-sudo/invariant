
(function() {
/**
 * ====== Lume Standard Library ======
 * Built-in functions available in all Lume programs.
 * 
 * Modules:
 *   - text:   String manipulation
 *   - math:   Mathematical operations
 *   - list:   Array operations
 *   - time:   Date/time utilities
 *   - convert: Type conversion
 */

// ══════════════════════════
//  TEXT MODULE
// ══════════════════════════

const text = {
    upper: (s) => String(s).toUpperCase(),
    lower: (s) => String(s).toLowerCase(),
    trim: (s) => String(s).trim(),
    split: (s, sep) => String(s).split(sep),
    join: (arr, sep = ', ') => arr.join(sep),
    replace: (s, from, to) => String(s).replaceAll(from, to),
    contains: (s, sub) => String(s).includes(sub),
    starts_with: (s, prefix) => String(s).startsWith(prefix),
    ends_with: (s, suffix) => String(s).endsWith(suffix),
    length: (s) => String(s).length,
    reverse: (s) => String(s).split('').reverse().join(''),
    repeat: (s, n) => String(s).repeat(n),
    pad_left: (s, n, ch = ' ') => String(s).padStart(n, ch),
    pad_right: (s, n, ch = ' ') => String(s).padEnd(n, ch),
    slice: (s, start, end) => String(s).slice(start, end),
    chars: (s) => String(s).split(''),
}

// ══════════════════════════
//  MATH MODULE
// ══════════════════════════

const math = {
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    min: (...args) => Math.min(...args),
    max: (...args) => Math.max(...args),
    pow: Math.pow,
    sqrt: Math.sqrt,
    random: () => Math.random(),
    random_int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    pi: Math.PI,
    e: Math.E,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    log: Math.log,
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    lerp: (a, b, t) => a + (b - a) * t,
    sum: (arr) => arr.reduce((a, b) => a + b, 0),
    average: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
}

// ══════════════════════════
//  LIST MODULE
// ══════════════════════════

const list = {
    first: (arr) => arr[0],
    last: (arr) => arr[arr.length - 1],
    rest: (arr) => arr.slice(1),
    take: (arr, n) => arr.slice(0, n),
    drop: (arr, n) => arr.slice(n),
    map: (arr, fn) => arr.map(fn),
    filter: (arr, fn) => arr.filter(fn),
    reduce: (arr, fn, init) => arr.reduce(fn, init),
    find: (arr, fn) => arr.find(fn),
    contains: (arr, item) => arr.includes(item),
    unique: (arr) => [...new Set(arr)],
    flat: (arr) => arr.flat(),
    sort: (arr, fn) => [...arr].sort(fn),
    reverse: (arr) => [...arr].reverse(),
    zip: (a, b) => a.map((v, i) => [v, b[i]]),
    range: (start, end, step = 1) => {
        const result = []
        for (let i = start; i < end; i += step) result.push(i)
        return result
    },
    chunk: (arr, size) => {
        const chunks = []
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size))
        }
        return chunks
    },
    group_by: (arr, fn) => {
        const groups = {}
        for (const item of arr) {
            const key = fn(item)
            if (!groups[key]) groups[key] = []
            groups[key].push(item)
        }
        return groups
    },
    count: (arr) => arr.length,
    empty: (arr) => arr.length === 0,
}

// ══════════════════════════
//  TIME MODULE
// ══════════════════════════

const time = {
    now: () => Date.now(),
    today: () => new Date().toISOString().split('T')[0],
    timestamp: () => new Date().toISOString(),
    format: (ms, fmt = 'iso') => {
        const d = new Date(ms)
        if (fmt === 'iso') return d.toISOString()
        if (fmt === 'date') return d.toLocaleDateString()
        if (fmt === 'time') return d.toLocaleTimeString()
        return d.toString()
    },
    elapsed: (startMs) => Date.now() - startMs,
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
}

// ══════════════════════════
//  CONVERT MODULE
// ══════════════════════════

const convert = {
    to_number: (v) => Number(v),
    to_text: (v) => String(v),
    to_boolean: (v) => Boolean(v),
    to_json: (v) => JSON.stringify(v, null, 2),
    from_json: (s) => JSON.parse(s),
}

// ══════════════════════════
//  DOM MODULE (Browser)
// ══════════════════════════

const dom = {
    /**
     * Create an HTML element with optional config.
     * @param {string} tag - Element tag (div, h1, p, section, nav, img, a, span, etc.)
     * @param {object} [opts] - { text, html, id, className, styles, attrs, children, onClick }
     * @returns {HTMLElement}
     */
    create: (tag, opts = {}) => {
        const el = document.createElement(tag)
        if (opts.text) el.textContent = opts.text
        if (opts.html) el.innerHTML = opts.html
        if (opts.id) el.id = opts.id
        if (opts.className) el.className = opts.className
        if (opts.styles) Object.assign(el.style, opts.styles)
        if (opts.attrs) {
            for (const [k, v] of Object.entries(opts.attrs)) {
                el.setAttribute(k, v)
            }
        }
        if (opts.children) {
            for (const child of opts.children) {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child))
                } else {
                    el.appendChild(child)
                }
            }
        }
        if (opts.onClick) el.addEventListener('click', opts.onClick)
        return el
    },

    /** Select a single element. */
    select: (selector) => document.querySelector(selector),

    /** Select all matching elements. */
    select_all: (selector) => [...document.querySelectorAll(selector)],

    /** Append a child to a parent. */
    add_child: (parent, child) => {
        if (typeof parent === 'string') parent = document.querySelector(parent)
        if (typeof child === 'string') child = document.createTextNode(child)
        parent.appendChild(child)
        return child
    },

    /** Set text content. */
    set_text: (el, text) => {
        if (typeof el === 'string') el = document.querySelector(el)
        el.textContent = text
    },

    /** Set innerHTML. */
    set_html: (el, html) => {
        if (typeof el === 'string') el = document.querySelector(el)
        el.innerHTML = html
    },

    /** Set a single style property. */
    set_style: (el, prop, val) => {
        if (typeof el === 'string') el = document.querySelector(el)
        el.style[prop] = val
    },

    /** Set multiple styles. */
    set_styles: (el, styles) => {
        if (typeof el === 'string') el = document.querySelector(el)
        Object.assign(el.style, styles)
    },

    /** Add a CSS class. */
    add_class: (el, ...classes) => {
        if (typeof el === 'string') el = document.querySelector(el)
        el.classList.add(...classes)
    },

    /** Remove a CSS class. */
    remove_class: (el, ...classes) => {
        if (typeof el === 'string') el = document.querySelector(el)
        el.classList.remove(...classes)
    },

    /** Toggle a CSS class. */
    toggle_class: (el, cls) => {
        if (typeof el === 'string') el = document.querySelector(el)
        el.classList.toggle(cls)
    },

    /** Add an event listener. */
    on: (el, event, fn) => {
        if (typeof el === 'string') el = document.querySelector(el)
        el.addEventListener(event, fn)
    },

    /** Mount an element to the document body (or a target). */
    mount: (el, target) => {
        const parent = target
            ? (typeof target === 'string' ? document.querySelector(target) : target)
            : document.body
        parent.appendChild(el)
        return el
    },

    /**
     * Inject a CSS string into the page via a <style> tag.
     * @param {string} css - Raw CSS text
     * @param {string} [id] - Optional style element ID (prevents duplicates)
     * @returns {HTMLStyleElement}
     */
    inject_css: (css, id) => {
        if (id) {
            const existing = document.getElementById(id)
            if (existing) { existing.textContent = css; return existing }
        }
        const style = document.createElement('style')
        if (id) style.id = id
        style.textContent = css
        document.head.appendChild(style)
        return style
    },

    /**
     * Animate an element using the Web Animations API.
     * @param {HTMLElement|string} el
     * @param {Keyframe[]} keyframes - Array of keyframe objects
     * @param {object} options - { duration, easing, iterations, fill, delay }
     * @returns {Animation}
     */
    animate: (el, keyframes, options = {}) => {
        if (typeof el === 'string') el = document.querySelector(el)
        return el.animate(keyframes, {
            duration: options.duration || 1000,
            easing: options.easing || 'ease',
            iterations: options.iterations || 1,
            fill: options.fill || 'forwards',
            delay: options.delay || 0,
        })
    },

    /**
     * Create a CSS keyframe animation and inject it.
     * @param {string} name - Animation name
     * @param {string} keyframeCSS - Raw @keyframes body
     * @returns {string} The animation name (for use in style rules)
     */
    keyframes: (name, keyframeCSS) => {
        dom.inject_css(`@keyframes ${name} { ${keyframeCSS} }`, `kf-${name}`)
        return name
    },

    /** Remove an element from the DOM. */
    remove: (el) => {
        if (typeof el === 'string') el = document.querySelector(el)
        if (el && el.parentNode) el.parentNode.removeChild(el)
    },

    /** Remove all children of an element. */
    clear: (el) => {
        if (typeof el === 'string') el = document.querySelector(el)
        while (el.firstChild) el.removeChild(el.firstChild)
    },

    /** Set a data attribute. */
    set_data: (el, key, value) => {
        if (typeof el === 'string') el = document.querySelector(el)
        el.dataset[key] = value
    },

    /** Get a data attribute. */
    get_data: (el, key) => {
        if (typeof el === 'string') el = document.querySelector(el)
        return el.dataset[key]
    },

    /** Scroll an element (or window) smoothly. */
    scroll_to: (target, options = {}) => {
        if (typeof target === 'string') target = document.querySelector(target)
        const el = target || window
        el.scrollTo({ top: options.top || 0, left: options.left || 0, behavior: options.smooth !== false ? 'smooth' : 'auto' })
    },

    /** Observe an element entering the viewport (for skeleton reveals). */
    on_visible: (el, callback, options = {}) => {
        if (typeof el === 'string') el = document.querySelector(el)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target)
                    if (options.once !== false) observer.unobserve(entry.target)
                }
            })
        }, { threshold: options.threshold || 0.1 })
        observer.observe(el)
        return observer
    },

    /** Batch-observe multiple elements for viewport entry (skeleton reveal pattern). */
    reveal_on_scroll: (selector, options = {}) => {
        const elements = document.querySelectorAll(selector)
        const delay = options.stagger || 100
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1'
                        entry.target.style.transform = 'translateY(0)'
                    }, i * delay)
                    observer.unobserve(entry.target)
                }
            })
        }, { threshold: options.threshold || 0.1 })
        elements.forEach(el => {
            el.style.opacity = '0'
            el.style.transform = 'translateY(20px)'
            el.style.transition = `opacity ${options.duration || 600}ms ease, transform ${options.duration || 600}ms ease`
            observer.observe(el)
        })
        return observer
    },

    /** Wait for DOMContentLoaded. */
    ready: (fn) => {
        if (document.readyState !== 'loading') fn()
        else document.addEventListener('DOMContentLoaded', fn)
    },
}

// ══════════════════════════
//  STATE MODULE
// ══════════════════════════

const state = {
    /**
     * Create a state machine.
     * @param {object} config - { initial, states: { [name]: { on: { EVENT: 'nextState' } } } }
     * @returns {object} Machine with { current, send, on_change, value }
     */
    machine: (config) => {
        let current = config.initial
        const listeners = []
        return {
            get current() { return current },
            send(event) {
                const stateConfig = config.states[current]
                if (stateConfig && stateConfig.on && stateConfig.on[event]) {
                    const next = stateConfig.on[event]
                    const prev = current
                    current = typeof next === 'string' ? next : next.target
                    if (typeof next === 'object' && next.action) next.action(prev, current)
                    listeners.forEach(fn => fn(current, prev, event))
                }
                return current
            },
            on_change(fn) { listeners.push(fn) },
        }
    },

    /**
     * Create a reactive value (simple observable).
     * @param {*} initial - Initial value
     * @returns {object} { get, set, on_change, bind }
     */
    reactive: (initial) => {
        let value = initial
        const listeners = []
        return {
            get: () => value,
            set: (newVal) => {
                const old = value
                value = newVal
                listeners.forEach(fn => fn(value, old))
            },
            on_change: (fn) => { listeners.push(fn) },
            /** Bind to a DOM element's textContent. */
            bind: (el) => {
                if (typeof el === 'string') el = document.querySelector(el)
                el.textContent = value
                listeners.push((v) => { el.textContent = v })
            },
        }
    },
}

// ══════════════════════════
//  EXPORTS
// ══════════════════════════

const stdlib = { text, math, list, time, convert, dom, state }

window.dom = dom; window.state = state; window.text = text; window.math = math; window.list = list; window.time = time; window.convert = convert;
})();

// Generated by Lume Compiler

// GovernanceCore — Apex UI Node
const noise = dom.create("div", { className: "noise" });
const os_core = dom.create("div", { id: "os-core" });
const nav = dom.create("nav", { className: "reveal", styles: { padding: "32px 48px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" } });
const logo = dom.create("div", { html: "GOVERNANCECORE", styles: { fontFamily: "var(--font-heading)", fontWeight: "900", fontSize: "1.5rem", letterSpacing: "0.1em", color: "#FFFFFF" } });
const nav_link = dom.create("a", { html: "OS CORE ->", attrs: { href: "/" }, styles: { color: "var(--text-secondary)", textDecoration: "none", fontFamily: "var(--font-body)", fontWeight: "600" } });
dom.add_child(nav, logo);
dom.add_child(nav, nav_link);
const hero_sec = dom.create("section", { className: "hero-sec", styles: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center" } });
const hero_h1 = dom.create("h1", { className: "title-monolith reveal", html: "GOVERNANCECORE" });
const hero_h2 = dom.create("h2", { className: "text-stark reveal", html: "Governance Flow Engine", styles: { color: "#FFFFFF", marginTop: "24px" } });
const hero_p = dom.create("p", { className: "text-stark reveal", html: "Rule coherence, multi-agent coordination, fairness, conflict resolution.", styles: { marginTop: "24px", maxWidth: "600px" } });
dom.add_child(hero_sec, hero_h1);
dom.add_child(hero_sec, hero_h2);
dom.add_child(hero_sec, hero_p);
dom.add_child(os_core, nav);
dom.add_child(os_core, hero_sec);
// --- PRIMITIVE CAROUSEL ---
const eco_sec = dom.create("section", { className: "section section-dark", styles: { padding: "120px 0 0 0" } });
const eco_container = dom.create("div", { className: "container" });
const eco_h3 = dom.create("h3", { className: "title-monolith", html: "STRUCTURAL PRIMITIVES", styles: { fontSize: "clamp(2rem, 4vw, 4.5rem)" } });
const eco_track = dom.create("div", { className: "carousel-track reveal" });
const c1 = dom.create("a", { className: "carousel-card", attrs: { onclick: "openApp('./engine.html?primitive=Rules', 'Rule Coherence'); return false;", href: "#" } });
const c1_in = dom.create("div", { className: "card-inner" });
const c1_img = dom.create("img", { className: "card-img", attrs: { src: "./assets/governancecore_rules.png" } });
const c1_con = dom.create("div", { className: "card-content" });
const c1_t = dom.create("h4", { className: "card-title", html: "Rule Coherence" });
const c1_d = dom.create("p", { className: "card-desc", html: "Rule clarity, compliance level, rule drift risk." });
const c1_b = dom.create("div", { className: "card-bot", html: "ENGAGE NODE →" });
dom.add_child(c1_con, c1_t);
dom.add_child(c1_con, c1_d);
dom.add_child(c1_con, c1_b);
dom.add_child(c1_in, c1_img);
dom.add_child(c1_in, c1_con);
dom.add_child(c1, c1_in);
dom.add_child(eco_track, c1);
const c2 = dom.create("a", { className: "carousel-card", attrs: { onclick: "openApp('./engine.html?primitive=Coordination', 'Coordination Flow'); return false;", href: "#" } });
const c2_in = dom.create("div", { className: "card-inner" });
const c2_img = dom.create("img", { className: "card-img", attrs: { src: "./assets/governancecore_coordination.png" } });
const c2_con = dom.create("div", { className: "card-content" });
const c2_t = dom.create("h4", { className: "card-title", html: "Coordination Flow" });
const c2_d = dom.create("p", { className: "card-desc", html: "Agent alignment, resource allocation, bottleneck severity." });
const c2_b = dom.create("div", { className: "card-bot", html: "ENGAGE NODE →" });
dom.add_child(c2_con, c2_t);
dom.add_child(c2_con, c2_d);
dom.add_child(c2_con, c2_b);
dom.add_child(c2_in, c2_img);
dom.add_child(c2_in, c2_con);
dom.add_child(c2, c2_in);
dom.add_child(eco_track, c2);
const c3 = dom.create("a", { className: "carousel-card", attrs: { onclick: "openApp('./engine.html?primitive=Fairness', 'Fairness Flow'); return false;", href: "#" } });
const c3_in = dom.create("div", { className: "card-inner" });
const c3_img = dom.create("img", { className: "card-img", attrs: { src: "./assets/governancecore_fairness.png" } });
const c3_con = dom.create("div", { className: "card-content" });
const c3_t = dom.create("h4", { className: "card-title", html: "Fairness Flow" });
const c3_d = dom.create("p", { className: "card-desc", html: "Distributive equity, bias pressure, representation balance." });
const c3_b = dom.create("div", { className: "card-bot", html: "ENGAGE NODE →" });
dom.add_child(c3_con, c3_t);
dom.add_child(c3_con, c3_d);
dom.add_child(c3_con, c3_b);
dom.add_child(c3_in, c3_img);
dom.add_child(c3_in, c3_con);
dom.add_child(c3, c3_in);
dom.add_child(eco_track, c3);
const c4 = dom.create("a", { className: "carousel-card", attrs: { onclick: "openApp('./engine.html?primitive=Conflict', 'Conflict Resolution'); return false;", href: "#" } });
const c4_in = dom.create("div", { className: "card-inner" });
const c4_img = dom.create("img", { className: "card-img", attrs: { src: "./assets/governancecore_conflict.png" } });
const c4_con = dom.create("div", { className: "card-content" });
const c4_t = dom.create("h4", { className: "card-title", html: "Conflict Resolution" });
const c4_d = dom.create("p", { className: "card-desc", html: "Escalation pressure, active disputes, deadlock risk." });
const c4_b = dom.create("div", { className: "card-bot", html: "ENGAGE NODE →" });
dom.add_child(c4_con, c4_t);
dom.add_child(c4_con, c4_d);
dom.add_child(c4_con, c4_b);
dom.add_child(c4_in, c4_img);
dom.add_child(c4_in, c4_con);
dom.add_child(c4, c4_in);
dom.add_child(eco_track, c4);
dom.add_child(eco_container, eco_h3);
dom.add_child(eco_sec, eco_container);
dom.add_child(eco_sec, eco_track);
dom.add_child(os_core, eco_sec);
// --------------------------
// Overlay
const overlay = dom.create("div", { id: "app-overlay" });
const o_header = dom.create("div", { className: "overlay-header" });
const o_title_wrap = dom.create("div", { className: "overlay-title" });
const o_dot = dom.create("div", { className: "status-dot" });
const o_title_text = dom.create("span", { id: "overlay-title", html: "SYSTEM" });
const o_close = dom.create("button", { className: "close-btn", html: "TERMINATE", attrs: { onclick: "closeApp()" } });
dom.add_child(o_title_wrap, o_dot);
dom.add_child(o_title_wrap, o_title_text);
dom.add_child(o_header, o_title_wrap);
dom.add_child(o_header, o_close);
const iframe = dom.create("iframe", { id: "app-iframe", attrs: { src: "about:blank" } });
dom.add_child(overlay, o_header);
dom.add_child(overlay, iframe);
dom.add_child(document.body, noise);
dom.mount(os_core);
dom.mount(overlay);
console.log("GovernanceCore UI Module Loaded.");
