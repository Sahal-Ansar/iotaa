/*
 * FDFED — Redux Toolkit todo app.
 * The five files exactly as they are drilled. Formatting is normalised
 * (grading ignores whitespace anyway); tokens match the original files,
 * with ONE correction — see the note on App.jsx line 25.
 */

const src = (s) => s.replace(/^\n/, "").replace(/\n$/, "").split("\n");

export const FILES = [
  {
    name: "App.jsx",
    lang: "jsx",
    role: "The component: holds the input text, reads todos from the store, dispatches actions.",
    lines: src(`
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTodo, toggleTodo, deleteTodo } from "./todoSlice";

export default function App() {
  const [text, setText] = useState("");
  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  const handleAdd = () => {
    if (!text.trim()) return;
    dispatch(addTodo(text));
    setText("");
  };

  return (
    <div className="container">
      <h1>TODOS</h1>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleAdd}>Add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <span
              onClick={() => dispatch(toggleTodo(t.id))}
              style={{ textDecoration: t.done ? "line-through" : "none" }}
            >
              {t.text}
            </span>
            <button onClick={() => dispatch(deleteTodo(t.id))}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`),
    notes: [
      "<b>useState</b> comes from <b>react</b> — it holds the text typed in the input box. This is local component state, not Redux.",
      "<b>useSelector</b> reads from the Redux store; <b>useDispatch</b> gives the function that sends actions. Both come from <b>react-redux</b>, not react.",
      "The three action creators, imported by name from <b>./todoSlice</b> — they are the <code>export const { … } = todoSlice.actions</code> line in that file.",
      null,
      "A <b>default export</b> — which is why main.jsx imports it as <code>import App from \"./App\"</code> with no braces.",
      "<b>text</b> is the current input value, <b>setText</b> updates it. Starts as an empty string <code>\"\"</code>.",
      "Reads <b>state.todos</b> — the key <b>todos</b> exists because store.js registered <code>reducer: { todos: todoReducer }</code>.",
      "Grab <b>dispatch</b> once so the handlers below can send actions to the store.",
      null,
      "<b>handleAdd</b> is an arrow function attached to the Add button's onClick.",
      "Guard: <code>!text.trim()</code> is true for an empty or all-spaces input, so nothing is added. Note the <b>!</b> — without it the logic is inverted.",
      "<code>addTodo(text)</code> builds the action <code>{ type: \"todos/addTodo\", payload: text }</code>; <b>dispatch</b> sends it to the reducer.",
      "Clear the input after adding.",
      "Closes handleAdd. The semicolon ends the <code>const</code> statement.",
      null,
      "The component returns JSX wrapped in parentheses.",
      "<b>className</b>, not class — JSX uses className. <b>container</b> is styled in index.css (width 400px).",
      "The heading — the text is exactly <b>TODOS</b>.",
      "A <b>controlled input</b>: <code>value={text}</code> shows state, <code>onChange</code> writes <code>e.target.value</code> back with setText.",
      "Clicking <b>Add</b> runs handleAdd. Pass the function itself — <code>onClick={handleAdd}</code>, not <code>handleAdd()</code>.",
      "Unordered list that holds the todos.",
      "<code>todos.map</code> turns each todo object <b>t</b> into an <code>&lt;li&gt;</code>. Note <code>(t) =&gt; (</code> — parentheses, so the JSX is returned implicitly.",
      "Every list item needs a <b>key</b> — the todo's <b>id</b> (which addTodo set to <code>Date.now()</code>).",
      "Opening tag of the span that shows the text — split across lines because it has two props.",
      "Clicking the text toggles done. <b>Your source file has <code>dispatch(toggle(toggleTodo(t.id)))</code></b> — <code>toggle</code> is never imported or defined, so clicking a todo would crash with <i>ReferenceError: toggle is not defined</i>. The correct call is <b><code>dispatch(toggleTodo(t.id))</code></b>, which is what's drilled here.",
      "Inline style: <b>double braces</b> — outer for the JSX expression, inner for the object. Done todos get <code>\"line-through\"</code>, others <code>\"none\"</code>.",
      "Closes the span's opening tag.",
      "The todo's text, rendered inside the span.",
      "Closes the span.",
      "Delete button: <code>deleteTodo(t.id)</code> — passes the <b>id</b>, which the reducer filters out. The button label is <b>X</b>.",
      "Closes the list item.",
      "<code>))}</code> — closes the JSX paren, the map call, and the curly expression, in that order.",
      "Closes the list.",
      "Closes the container div.",
      "Closes the return's parentheses.",
      "Closes the App function."
    ]
  },
  {
    name: "main.jsx",
    lang: "jsx",
    role: "The entry point: creates the React root and wraps App in the Redux Provider.",
    lines: src(`
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
`),
    notes: [
      "<b>createRoot</b> is a named import from <b>\"react-dom/client\"</b> — the <code>/client</code> part is easy to forget.",
      "<b>Provider</b> comes from <b>react-redux</b>. It makes the store available to every component below it.",
      "<b>{ store }</b> in braces — store.js uses a <b>named</b> export: <code>export const store</code>.",
      "<b>App</b> without braces — App.jsx uses <code>export default</code>.",
      "A side-effect import: just loads the stylesheet, no name is bound.",
      null,
      "Find the <code>&lt;div id=\"root\"&gt;</code> in index.html, create a React root on it, and call <b>.render(</b>…",
      "Wrap the app in <b>Provider</b> and hand it the store through the <b>store</b> prop: <code>store={store}</code>.",
      "App renders inside Provider, so useSelector and useDispatch work in it.",
      "Close Provider.",
      "Close the render call."
    ]
  },
  {
    name: "store.js",
    lang: "js",
    role: "Creates the Redux store and registers the todo reducer under the key todos.",
    lines: src(`
import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "./todoSlice";

export const store = configureStore({
  reducer: { todos: todoReducer },
});
`),
    notes: [
      "<b>configureStore</b> is from <b>\"@reduxjs/toolkit\"</b> — the @ and the slash both matter.",
      "Default import — todoSlice.js ends with <code>export default todoSlice.reducer</code>, and you can name it anything; here <b>todoReducer</b>.",
      null,
      "<b>Named</b> export <code>export const store</code> — that is why main.jsx imports <code>{ store }</code> with braces.",
      "<b>reducer</b> (singular) holds an object of slices. The key <b>todos</b> is what makes <code>state.todos</code> work in App.jsx.",
      "Close the configureStore call and the statement."
    ]
  },
  {
    name: "todoSlice.js",
    lang: "js",
    role: "Defines the todo state and the three reducers with createSlice, and exports the actions and the reducer.",
    lines: src(`
import { createSlice } from "@reduxjs/toolkit";

const todoSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ id: Date.now(), text: action.payload, done: false });
    },
    toggleTodo: (state, action) => {
      const t = state.find((x) => x.id === action.payload);
      if (t) t.done = !t.done;
    },
    deleteTodo: (state, action) =>
      state.filter((x) => x.id !== action.payload),
  },
});

export const { addTodo, toggleTodo, deleteTodo } = todoSlice.actions;
export default todoSlice.reducer;
`),
    notes: [
      "<b>createSlice</b> from <b>\"@reduxjs/toolkit\"</b> — it generates the reducer and the action creators together.",
      null,
      "Call createSlice with a config object and keep the result as <b>todoSlice</b>.",
      "<b>name</b> becomes the prefix of every action type, e.g. <code>\"todos/addTodo\"</code>.",
      "State starts as an <b>empty array</b> <code>[]</code> — not an object. (data.json is not used by the app.)",
      "<b>reducers</b> (plural) — one function per action.",
      "Every reducer receives <b>(state, action)</b>.",
      "<b>push</b> a new todo object: <code>id: Date.now()</code>, <code>text: action.payload</code>, <code>done: false</code>. Mutating is allowed here because Redux Toolkit uses Immer.",
      "Close addTodo.",
      "toggleTodo — same <b>(state, action)</b> signature.",
      "<b>find</b> (not filter) the todo whose id matches the payload — <code>===</code>, strict equality.",
      "If it exists, flip <b>done</b>: <code>t.done = !t.done</code>.",
      "Close toggleTodo.",
      "deleteTodo has <b>no curly braces</b> — the arrow body on the next line is returned directly.",
      "<b>filter</b> keeps every todo whose id is <b>not</b> the payload — <code>!==</code>. Returning a new array replaces the state.",
      "Close the reducers object.",
      "Close the config object and the createSlice call.",
      null,
      "Destructure the three generated <b>action creators</b> from <code>todoSlice.actions</code> and export them by name — App.jsx imports exactly these.",
      "The reducer is the <b>default</b> export — store.js imports it as todoReducer."
    ]
  },
  {
    name: "index.css",
    lang: "css",
    role: "Centres the page and fixes the container width.",
    lines: src(`
body { font-family: sans-serif; display: flex; justify-content: center; }
.container { width: 400px; }
`),
    notes: [
      "<b>body</b>: sans-serif font, <b>display: flex</b> and <b>justify-content: center</b> to centre the container horizontally.",
      "<b>.container</b> (a class selector, matching <code>className=\"container\"</code> in App.jsx) is <b>400px</b> wide."
    ]
  }
];

/* Logical chunks, used for fill-the-blanks and put-in-order rounds. [start, end] inclusive. */
export const BLANK_CHUNKS = [
  { f: 0, from: 0, to: 2, label: "imports" },
  { f: 0, from: 4, to: 13, label: "state & handleAdd" },
  { f: 0, from: 15, to: 25, label: "JSX — top half" },
  { f: 0, from: 23, to: 35, label: "JSX — bottom half" },
  { f: 1, from: 0, to: 10, label: "whole file" },
  { f: 2, from: 0, to: 5, label: "whole file" },
  { f: 3, from: 0, to: 8, label: "slice & addTodo" },
  { f: 3, from: 9, to: 19, label: "toggle, delete & exports" },
  { f: 4, from: 0, to: 1, label: "whole file" }
];

export const ORDER_CHUNKS = [
  { f: 0, from: 0, to: 13, label: "imports, state & handleAdd" },
  { f: 0, from: 15, to: 22, label: "JSX — container, input, list start" },
  { f: 0, from: 23, to: 35, label: "JSX — the list item & closing tags" },
  { f: 1, from: 0, to: 10, label: "whole file" },
  { f: 2, from: 0, to: 5, label: "whole file" },
  { f: 3, from: 0, to: 8, label: "slice & addTodo" },
  { f: 3, from: 9, to: 19, label: "toggle, delete & exports" },
  { f: 4, from: 0, to: 1, label: "whole file" }
];

/*
 * Bug hunt. Each bug replaces exactly one line. `why` explains the failure.
 */
export const BUGS = [
  // App.jsx
  { f: 0, line: 0, bad: 'import { useState } from "react-redux";', why: "useState is a React hook — it comes from <b>react</b>, not react-redux." },
  { f: 0, line: 1, bad: 'import { useSelector, useDispatch } from "react";', why: "useSelector and useDispatch are Redux hooks — they come from <b>react-redux</b>." },
  { f: 0, line: 2, bad: 'import { addTodo, toggleTodo, deleteTodo } from "./store";', why: "The action creators are exported from <b>./todoSlice</b>. store.js only exports the store." },
  { f: 0, line: 4, bad: "export function App() {", why: "App must be the <b>default</b> export — main.jsx imports it with <code>import App from \"./App\"</code> (no braces)." },
  { f: 0, line: 5, bad: 'const [text, setText] = useState();', why: "Without the initial <code>\"\"</code>, text starts as <b>undefined</b> and <code>text.trim()</code> throws on the first click." },
  { f: 0, line: 6, bad: "const todos = useSelector((state) => state.todo);", why: "The store key is <b>todos</b> (plural) — set in store.js. <code>state.todo</code> is undefined, so <code>todos.map</code> crashes." },
  { f: 0, line: 7, bad: "const dispatch = useDispatch;", why: "useDispatch is a hook — it must be <b>called</b>: <code>useDispatch()</code>." },
  { f: 0, line: 10, bad: "if (text.trim()) return;", why: "Missing <b>!</b> — this returns early whenever there IS text, so nothing can ever be added." },
  { f: 0, line: 11, bad: "dispatch(addTodo);", why: "<code>addTodo</code> must be called with the text — <code>addTodo(text)</code> — to build the action object." },
  { f: 0, line: 16, bad: '<div class="container">', why: "JSX uses <b>className</b>, not class." },
  { f: 0, line: 18, bad: "<input value={text} onChange={(e) => setText(e.value)} />", why: "The typed value is <code>e.<b>target</b>.value</code>. <code>e.value</code> is undefined." },
  { f: 0, line: 19, bad: "<button onClick={handleAdd()}>Add</button>", why: "<code>handleAdd()</code> runs during render. Pass the function itself: <code>onClick={handleAdd}</code>." },
  { f: 0, line: 21, bad: "{todos.forEach((t) => (", why: "<b>forEach</b> returns undefined, so nothing renders. Use <b>map</b>." },
  { f: 0, line: 22, bad: "<li>", why: "List items need a <b>key</b> — <code>&lt;li key={t.id}&gt;</code>." },
  { f: 0, line: 24, bad: "onClick={() => dispatch(toggle(toggleTodo(t.id)))}", why: "<b>This is the line in your source file.</b> <code>toggle</code> is never imported or defined — clicking a todo throws <i>ReferenceError: toggle is not defined</i>. Correct: <code>dispatch(toggleTodo(t.id))</code>." },
  { f: 0, line: 25, bad: 'style={{ textDecoration: t.done ? "none" : "line-through" }}', why: "The ternary is backwards — finished todos (<code>t.done</code> true) should get <b>\"line-through\"</b>." },
  { f: 0, line: 25, bad: 'style={ textDecoration: t.done ? "line-through" : "none" }', why: "Inline styles need <b>double braces</b> — the outer pair is the JSX expression, the inner pair is the object." },
  { f: 0, line: 29, bad: "<button onClick={() => dispatch(deleteTodo(t))}>X</button>", why: "The reducer compares <code>x.id !== action.payload</code>, so the payload must be the <b>id</b>: <code>deleteTodo(t.id)</code>." },
  // main.jsx
  { f: 1, line: 0, bad: 'import { createRoot } from "react-dom";', why: "In React 18 createRoot is imported from <b>\"react-dom/client\"</b>." },
  { f: 1, line: 1, bad: 'import { Provider } from "@reduxjs/toolkit";', why: "Provider comes from <b>react-redux</b>." },
  { f: 1, line: 2, bad: 'import store from "./store";', why: "store.js has a <b>named</b> export (<code>export const store</code>), so it needs braces: <code>{ store }</code>." },
  { f: 1, line: 3, bad: 'import { App } from "./App";', why: "App is a <b>default</b> export — no braces." },
  { f: 1, line: 6, bad: 'createRoot(document.getElementById("app")).render(', why: "The mount point in index.html is <b>root</b>: <code>getElementById(\"root\")</code>." },
  { f: 1, line: 7, bad: "<Provider value={store}>", why: "The prop is named <b>store</b>: <code>&lt;Provider store={store}&gt;</code>." },
  // store.js
  { f: 2, line: 0, bad: 'import { configureStore } from "redux";', why: "configureStore is part of Redux <b>Toolkit</b>: <code>\"@reduxjs/toolkit\"</code>." },
  { f: 2, line: 1, bad: 'import { todoReducer } from "./todoSlice";', why: "The reducer is the <b>default</b> export of todoSlice.js — no braces." },
  { f: 2, line: 3, bad: "export default configureStore({", why: "main.jsx imports <code>{ store }</code>, so this must be the named export <code>export const store = …</code>." },
  { f: 2, line: 4, bad: "reducers: { todos: todoReducer },", why: "configureStore takes <b>reducer</b> (singular). <b>reducers</b> (plural) belongs to createSlice." },
  { f: 2, line: 4, bad: "reducer: todoReducer,", why: "Passing the reducer directly makes the whole state the array, so <code>state.todos</code> in App.jsx is undefined. It must be keyed: <code>{ todos: todoReducer }</code>." },
  // todoSlice.js
  { f: 3, line: 0, bad: 'import { createSlice } from "react-redux";', why: "createSlice comes from <b>\"@reduxjs/toolkit\"</b>." },
  { f: 3, line: 4, bad: "initialState: {},", why: "The todos are a list — <code>initialState: <b>[]</b></code>. An object has no <code>push</code>, <code>find</code> or <code>filter</code>." },
  { f: 3, line: 5, bad: "reducer: {", why: "createSlice takes <b>reducers</b> (plural)." },
  { f: 3, line: 7, bad: "state.push({ id: Date.now(), text: action.text, done: false });", why: "The value passed to addTodo arrives as <code>action.<b>payload</b></code>." },
  { f: 3, line: 7, bad: "state.push({ id: Date.now(), text: action.payload, done: true });", why: "A new todo starts unfinished — <code>done: <b>false</b></code>." },
  { f: 3, line: 10, bad: "const t = state.filter((x) => x.id === action.payload);", why: "<b>filter</b> returns an array, so <code>t.done</code> is undefined. Use <b>find</b> to get the single todo." },
  { f: 3, line: 11, bad: "if (t) t.done = true;", why: "Toggle means <b>flip</b>: <code>t.done = !t.done</code>. This can only ever mark done." },
  { f: 3, line: 14, bad: "state.filter((x) => x.id === action.payload),", why: "Inverted — this keeps ONLY the todo being deleted. Delete keeps everything whose id is <b>!==</b> the payload." },
  { f: 3, line: 18, bad: "export const { addTodo, toggleTodo, deleteTodo } = todoSlice.reducer;", why: "Action creators live on <code>todoSlice.<b>actions</b></code>." },
  { f: 3, line: 19, bad: "export default todoSlice.actions;", why: "The default export is <code>todoSlice.<b>reducer</b></code> — store.js registers it." },
  // index.css
  { f: 4, line: 0, bad: "body { font-family: sans-serif; display: flex; justify-content: centre; }", why: "CSS uses American spelling: <b>center</b>." },
  { f: 4, line: 0, bad: "body { font-family: sans-serif; display: block; justify-content: center; }", why: "<code>justify-content</code> only works on a flex (or grid) container — it needs <b>display: flex</b>." },
  { f: 4, line: 1, bad: "#container { width: 400px; }", why: "App.jsx uses <code>className=\"container\"</code>, so the selector is the class <b>.container</b>, not the id #container." },
  { f: 4, line: 1, bad: ".container { width: 400; }", why: "Lengths need a unit — <b>400px</b>." }
];

/*
 * Concept quiz. Options are written as plain text or with <code>.
 */
export const QUIZ = [
  { f: 1, q: "Which file is the entry point that renders the app into the page?", opts: ["App.jsx", "main.jsx", "store.js", "todoSlice.js"], a: 1, exp: "main.jsx calls <code>createRoot(…).render(…)</code>." },
  { f: 1, q: "What does <code>&lt;Provider store={store}&gt;</code> do?", opts: ["Creates the store", "Makes the store available to every component inside it", "Defines the reducers", "Renders the todo list"], a: 1, exp: "Provider passes the store down so useSelector and useDispatch work in App." },
  { f: 1, q: "Where is <code>createRoot</code> imported from?", opts: ["\"react\"", "\"react-dom\"", "\"react-dom/client\"", "\"react-redux\""], a: 2, exp: "<code>import { createRoot } from \"react-dom/client\";</code>" },
  { f: 1, q: "Why does main.jsx import <code>{ store }</code> with braces but <code>App</code> without?", opts: ["Braces are optional", "store is a named export, App is a default export", "store is a function, App is a component", "App is imported from a .jsx file"], a: 1, exp: "store.js: <code>export const store</code> (named). App.jsx: <code>export default function App</code>." },
  { f: 1, q: "What does <code>import \"./index.css\";</code> bind to a variable?", opts: ["styles", "css", "Nothing — it only loads the file", "index"], a: 2, exp: "It's a side-effect import: the stylesheet is applied, no name is created." },
  { f: 1, q: "Which element id does the app mount into?", opts: ["app", "root", "main", "container"], a: 1, exp: "<code>document.getElementById(\"root\")</code>" },
  { f: 2, q: "What does <code>configureStore</code> come from?", opts: ["\"redux\"", "\"react-redux\"", "\"@reduxjs/toolkit\"", "\"./todoSlice\""], a: 2, exp: "<code>import { configureStore } from \"@reduxjs/toolkit\";</code>" },
  { f: 2, q: "In store.js, why does App.jsx read <code>state.todos</code>?", opts: ["Because the slice is named \"todos\"", "Because the reducer is registered under the key todos", "Because initialState is called todos", "Because the file is todoSlice.js"], a: 1, exp: "<code>reducer: { todos: todoReducer }</code> — the key in that object is the key in state." },
  { f: 2, q: "Is it <code>reducer</code> or <code>reducers</code> in configureStore?", opts: ["reducer", "reducers", "either", "slice"], a: 0, exp: "configureStore takes <b>reducer</b>. createSlice takes <b>reducers</b>." },
  { f: 2, q: "What is <code>todoReducer</code> in store.js?", opts: ["A named export of todoSlice.js", "The default export of todoSlice.js — todoSlice.reducer", "A function written in store.js", "The action creators"], a: 1, exp: "todoSlice.js ends with <code>export default todoSlice.reducer;</code>" },
  { f: 2, q: "How is the store exported?", opts: ["export default store", "export const store = configureStore(…)", "module.exports = store", "It isn't exported"], a: 1, exp: "A named export — matching <code>import { store }</code> in main.jsx." },
  { f: 3, q: "What is the <code>initialState</code> of the slice?", opts: ["{}", "null", "[]", "The contents of data.json"], a: 2, exp: "<code>initialState: []</code> — data.json is not used." },
  { f: 3, q: "What is the action type dispatched by <code>addTodo(\"Milk\")</code>?", opts: ["\"addTodo\"", "\"todos/addTodo\"", "\"ADD_TODO\"", "\"todo/add\""], a: 1, exp: "createSlice prefixes with the slice <b>name</b>: <code>name: \"todos\"</code> → <code>\"todos/addTodo\"</code>." },
  { f: 3, q: "In addTodo, what is <code>action.payload</code>?", opts: ["The whole todo object", "The id", "The text passed to addTodo(text)", "The state"], a: 2, exp: "App dispatches <code>addTodo(text)</code>, so the payload is the text string." },
  { f: 3, q: "What fields does a new todo get?", opts: ["id, text, done", "id, title, completed", "key, text, done", "id, payload, done"], a: 0, exp: "<code>{ id: Date.now(), text: action.payload, done: false }</code>" },
  { f: 3, q: "How is the id of a new todo generated?", opts: ["Math.random()", "state.length + 1", "Date.now()", "crypto.randomUUID()"], a: 2, exp: "<code>id: Date.now()</code> — the current timestamp in milliseconds." },
  { f: 3, q: "Why is <code>state.push(…)</code> allowed when Redux state must be immutable?", opts: ["It isn't — it's a bug", "Redux Toolkit uses Immer, which turns the mutation into an immutable update", "Arrays are exempt", "Because the state is []"], a: 1, exp: "Inside createSlice reducers you may 'mutate' — Immer produces a new state safely." },
  { f: 3, q: "In toggleTodo, why <code>find</code> instead of <code>filter</code>?", opts: ["find is faster", "find returns the single matching todo; filter returns an array", "filter mutates", "No reason"], a: 1, exp: "<code>t.done</code> only works on the object, which find returns." },
  { f: 3, q: "What does <code>if (t) t.done = !t.done;</code> do?", opts: ["Marks the todo done", "Marks it not done", "Flips done between true and false", "Deletes it"], a: 2, exp: "<b>!</b> negates the current value — a toggle." },
  { f: 3, q: "Why does deleteTodo have no curly braces?", opts: ["It's a syntax error", "The arrow body is an expression, so the filtered array is returned directly", "It doesn't return anything", "Reducers can't have braces"], a: 1, exp: "<code>(state, action) =&gt; state.filter(…)</code> implicitly returns the new array, which replaces state." },
  { f: 3, q: "What does deleteTodo keep?", opts: ["Only the todo with the payload id", "Every todo whose id is !== the payload", "Every done todo", "Nothing"], a: 1, exp: "<code>state.filter((x) =&gt; x.id !== action.payload)</code>" },
  { f: 3, q: "What is destructured in <code>export const { addTodo, toggleTodo, deleteTodo } = …</code>?", opts: ["todoSlice.reducer", "todoSlice.actions", "todoSlice.reducers", "createSlice"], a: 1, exp: "The generated action creators live on <code>todoSlice.actions</code>." },
  { f: 3, q: "What is the default export of todoSlice.js?", opts: ["todoSlice", "todoSlice.actions", "todoSlice.reducer", "createSlice"], a: 2, exp: "<code>export default todoSlice.reducer;</code>" },
  { f: 3, q: "Which comparison does toggleTodo use?", opts: ["x.id == action.payload", "x.id === action.payload", "x.id !== action.payload", "x === action.payload"], a: 1, exp: "Strict equality <code>===</code>; delete uses <code>!==</code>." },
  { f: 0, q: "Which hook holds the text typed into the input?", opts: ["useSelector", "useDispatch", "useState", "useEffect"], a: 2, exp: "<code>const [text, setText] = useState(\"\");</code> — local component state." },
  { f: 0, q: "Where do <code>useSelector</code> and <code>useDispatch</code> come from?", opts: ["\"react\"", "\"react-redux\"", "\"@reduxjs/toolkit\"", "\"./store\""], a: 1, exp: "<code>import { useSelector, useDispatch } from \"react-redux\";</code>" },
  { f: 0, q: "What does <code>if (!text.trim()) return;</code> prevent?", opts: ["Adding duplicate todos", "Adding an empty or whitespace-only todo", "Adding more than 10 todos", "Clearing the input"], a: 1, exp: "trim() removes spaces; an empty result is falsy, so <code>!</code> makes the guard true." },
  { f: 0, q: "What runs when the Add button is clicked?", opts: ["dispatch(addTodo)", "handleAdd", "setText", "toggleTodo"], a: 1, exp: "<code>&lt;button onClick={handleAdd}&gt;Add&lt;/button&gt;</code>" },
  { f: 0, q: "What happens, in order, inside handleAdd for valid input?", opts: ["setText then dispatch", "dispatch(addTodo(text)) then setText(\"\")", "dispatch(toggleTodo) then setText", "Only setText(\"\")"], a: 1, exp: "Add the todo first, then clear the box." },
  { f: 0, q: "What is the <code>key</code> of each list item?", opts: ["t.text", "the map index", "t.id", "t.done"], a: 2, exp: "<code>&lt;li key={t.id}&gt;</code>" },
  { f: 0, q: "What happens when you click a todo's text?", opts: ["It is deleted", "Its done value is toggled", "It is edited", "Nothing"], a: 1, exp: "The span's onClick dispatches <code>toggleTodo(t.id)</code>." },
  { f: 0, q: "Your source file has <code>dispatch(toggle(toggleTodo(t.id)))</code>. What happens when a todo is clicked?", opts: ["It toggles normally", "It toggles twice", "It throws ReferenceError: toggle is not defined", "It deletes the todo"], a: 2, exp: "<code>toggle</code> is never imported. The correct line is <code>dispatch(toggleTodo(t.id))</code>." },
  { f: 0, q: "Which style is applied to a finished todo?", opts: ["color: grey", "textDecoration: \"line-through\"", "opacity: 0.5", "display: none"], a: 1, exp: "<code>style={{ textDecoration: t.done ? \"line-through\" : \"none\" }}</code>" },
  { f: 0, q: "Why does the style prop have two pairs of braces?", opts: ["It's a typo", "Outer = JSX expression, inner = JavaScript object", "Inner braces are CSS", "JSX requires it for every prop"], a: 1, exp: "<code>style={ { … } }</code> — an object inside an expression." },
  { f: 0, q: "What is the delete button's label?", opts: ["Delete", "Remove", "X", "×"], a: 2, exp: "<code>&lt;button …&gt;X&lt;/button&gt;</code>" },
  { f: 0, q: "What is the heading text?", opts: ["Todo List", "TODOS", "Todos", "My Todos"], a: 1, exp: "<code>&lt;h1&gt;TODOS&lt;/h1&gt;</code>" },
  { f: 0, q: "Why does App.jsx use <code>className</code> instead of <code>class</code>?", opts: ["class is reserved in JavaScript, so JSX uses className", "Personal style", "className is for CSS modules only", "Both are identical in JSX"], a: 0, exp: "JSX compiles to JavaScript, where <code>class</code> is a keyword." },
  { f: 0, q: "How is the input kept in sync with state?", opts: ["defaultValue only", "value={text} plus onChange calling setText(e.target.value)", "A ref", "useSelector"], a: 1, exp: "That pairing makes it a <b>controlled</b> input." },
  { f: 4, q: "Which CSS centres the container horizontally?", opts: ["margin: auto on body", "display: flex + justify-content: center on body", "text-align: center", "align-items: center"], a: 1, exp: "<code>body { …; display: flex; justify-content: center; }</code>" },
  { f: 4, q: "How wide is <code>.container</code>?", opts: ["100%", "500px", "400px", "40rem"], a: 2, exp: "<code>.container { width: 400px; }</code>" },
  { f: 4, q: "What font does the body use?", opts: ["serif", "monospace", "sans-serif", "Arial"], a: 2, exp: "<code>font-family: sans-serif</code>" }
];
