# Framer Motion / Motion — Animation Skill

> Library: `motion/react` (formerly `framer-motion`) — v12+
> Installed: ✅ `framer-motion` in package.json
> Import: `import { motion, AnimatePresence, useScroll, ... } from "motion/react"`

---

## CORE COMPONENT

```tsx
import { motion } from "motion/react"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
/>
```

Any HTML/SVG tag: `motion.div`, `motion.span`, `motion.button`, `motion.section`, `motion.img`, `motion.svg`, `motion.path`, `motion.circle`...

---

## ANIMATION PROPS

| Prop | Usage | Example |
|------|-------|---------|
| `initial` | Start state | `initial={{ opacity: 0, scale: 0.8 }}` |
| `animate` | Target state | `animate={{ opacity: 1, scale: 1 }}` |
| `exit` | Unmount state (needs AnimatePresence) | `exit={{ opacity: 0, y: -20 }}` |
| `transition` | Timing config | `transition={{ duration: 0.5, ease: "easeInOut" }}` |
| `variants` | Named states | `variants={variants} animate="visible"` |
| `whileHover` | Hover state | `whileHover={{ scale: 1.05 }}` |
| `whileTap` | Press state | `whileTap={{ scale: 0.95 }}` |
| `whileFocus` | Focus state | `whileFocus={{ outline: "2px solid blue" }}` |
| `whileInView` | Viewport trigger | `whileInView={{ opacity: 1 }}` |
| `viewport` | Viewport options | `viewport={{ once: true, amount: 0.3 }}` |
| `layout` | Layout animation | `layout` or `layout="position"` |
| `layoutId` | Shared element | `layoutId="card-1"` |
| `drag` | Enable drag | `drag` / `drag="x"` / `drag="y"` |
| `dragConstraints` | Drag bounds | `dragConstraints={{ left: 0, right: 300 }}` |
| `custom` | Dynamic variants | `custom={index}` |
| `inherit` | Inherit parent variants | `inherit={false}` |

---

## TRANSITIONS

### Spring (default for most)
```tsx
transition={{ type: "spring", bounce: 0.25 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
```

### Tween
```tsx
transition={{ duration: 0.4, ease: "easeOut" }}
transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // custom bezier
transition={{ duration: 1, ease: "easeInOut" }}
```

### Inertia (drag)
```tsx
dragTransition={{ power: 0.2, timeConstant: 200 }}
dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
```

### Orchestration
```tsx
transition={{ delay: 0.2 }}
transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
transition={{ when: "beforeChildren" }}
```

**Easing options:** `"linear"` `"easeIn"` `"easeOut"` `"easeInOut"` `"circIn"` `"circOut"` `"backIn"` `"backOut"` `"anticipate"`

---

## VARIANTS (stagger children)

```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map(i => (
    <motion.li key={i} variants={item}>{i}</motion.li>
  ))}
</motion.ul>
```

Dynamic variants:
```tsx
const variants = {
  visible: (custom: number) => ({
    opacity: 1,
    transition: { delay: custom * 0.15 }
  })
}
<motion.div custom={index} variants={variants} />
```

---

## ANIMATE PRESENCE (exit animations)

```tsx
import { AnimatePresence } from "motion/react"

<AnimatePresence mode="wait">
  {show && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    />
  )}
</AnimatePresence>
```

Modes: `"sync"` (default) | `"wait"` (exit then enter) | `"popLayout"` (pop exiting from layout)

---

## HOOKS

### useScroll — scroll-linked animations
```tsx
import { useScroll, useTransform } from "motion/react"

const { scrollYProgress } = useScroll()
// progress bar
<motion.div style={{ scaleX: scrollYProgress }} />

// element-based
const ref = useRef(null)
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
})
const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
const y = useTransform(scrollYProgress, [0, 1], [100, 0])
```

offset keywords: `"start"` `"center"` `"end"` or numbers 0–1 or `"100px"` or `"50%"` or `"50vh"`

### useMotionValue
```tsx
const x = useMotionValue(0)
<motion.div style={{ x }} />
```

### useSpring
```tsx
const springX = useSpring(mouseX, { stiffness: 300, damping: 30 })
```

### useTransform
```tsx
const scale = useTransform(scrollYProgress, [0, 1], [1, 2])
const color = useTransform(x, [-100, 0, 100], ["#f00", "#fff", "#0f0"])
```

### useInView
```tsx
const ref = useRef(null)
const isInView = useInView(ref, { once: true, amount: 0.3 })
```

### useAnimate (imperative)
```tsx
const [scope, animate] = useAnimate()
await animate(scope.current, { opacity: 1 }, { duration: 0.5 })
await animate("li", { opacity: 1 }, { delay: stagger(0.1) })
```

### useDragControls
```tsx
const controls = useDragControls()
<div onPointerDown={e => controls.start(e)} />
<motion.div drag="x" dragControls={controls} dragListener={false} />
```

### useReducedMotion (a11y)
```tsx
const shouldReduce = useReducedMotion()
const animation = shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }
```

---

## LAYOUT ANIMATIONS

```tsx
// Animate any layout change automatically
<motion.div layout />

// Position only
<motion.div layout="position" />

// Size only
<motion.div layout="size" />

// Shared element transition (magic move)
<motion.div layoutId="hero-image" />
// Renders in another place with same layoutId → animates between them
```

---

## SCROLL-TRIGGERED (whileInView)

```tsx
// Fade up on scroll
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  viewport={{ once: true, amount: 0.3 }}
/>

// Stagger list on scroll
<motion.ul
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
>
  {items.map(item => (
    <motion.li
      key={item}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    />
  ))}
</motion.ul>
```

---

## DRAG

```tsx
<motion.div
  drag
  dragConstraints={{ left: -200, right: 200, top: -100, bottom: 100 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1, cursor: "grabbing" }}
  dragMomentum={true}
/>

// Snap to grid
<motion.div
  drag
  dragTransition={{
    power: 0,
    modifyTarget: target => Math.round(target / 50) * 50
  }}
/>
```

---

## SVG ANIMATIONS

```tsx
// Draw path
<motion.path
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 2, ease: "easeInOut" }}
/>

// Morphing
<motion.circle
  animate={{ cx: 100, cy: 100, r: 50 }}
/>
```

---

## GESTURE PROPS

```tsx
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#3b82f6" }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ ring: "2px solid blue" }}
  onHoverStart={() => console.log("hover")}
  onHoverEnd={() => console.log("leave")}
  onTap={(e, info) => console.log(info.point)}
  onDrag={(e, info) => console.log(info.delta)}
  onAnimationComplete={() => console.log("done")}
/>
```

---

## CUSTOM COMPONENT

```tsx
import { motion } from "motion/react"
const MotionCard = motion.create(Card)

<MotionCard
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  whileHover={{ y: -4 }}
/>
```

---

## COMMON PATTERNS FOR nabdriyadah

### Fade-in section
```tsx
<motion.section
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
```

### Stagger article cards
```tsx
const container = { visible: { transition: { staggerChildren: 0.08 } } }
const card = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
<motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {articles.map(a => <motion.article key={a.slug} variants={card} />)}
</motion.div>
```

### Score counter animation
```tsx
<motion.span
  key={score}
  initial={{ opacity: 0, scale: 1.5 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", bounce: 0.5 }}
>
  {score}
</motion.span>
```

### Scroll progress bar
```tsx
const { scrollYProgress } = useScroll()
<motion.div
  style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
  className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-50"
/>
```

### Tab/page transition
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
  />
</AnimatePresence>
```

### Live match pulse
```tsx
<motion.div
  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
  className="w-2 h-2 rounded-full bg-green-500"
/>
```

---

## PERFORMANCE RULES

1. **Animate only:** `transform` (x, y, scale, rotate, skew) and `opacity` → GPU-accelerated
2. **Avoid animating:** `width`, `height`, `top`, `left`, `margin`, `padding` → triggers layout
3. **Use `useMotionValue`** instead of `useState` for values that update every frame
4. **`viewport={{ once: true }}`** to avoid re-triggering on scroll up
5. **`will-change: transform`** CSS for elements that will animate
6. **`layout` prop** instead of animating width/height directly

---

## ANIMATABLE CSS PROPERTIES

Transforms: `x` `y` `z` `rotate` `rotateX` `rotateY` `rotateZ` `scale` `scaleX` `scaleY` `skew` `skewX` `skewY` `originX` `originY` `perspective`

Visual: `opacity` `filter` `backdropFilter` `backgroundColor` `color` `borderColor` `boxShadow` `borderRadius`

SVG: `pathLength` `pathOffset` `pathSpacing` `cx` `cy` `r` `d`
