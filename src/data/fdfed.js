/*
 * FDFED — Problem 3: employee list with search, role filter and an
 * "active only" checkbox, split into components. State lives in App;
 * the children get values and handlers as props.
 * employees.json is data, so it isn't drilled (it's summarised in Study).
 */

const src = (s) => s.replace(/^\n/, "").replace(/\n$/, "").split("\n");

export const FILES = [
  {
    name: "App.jsx",
    lang: "jsx",
    role: "Holds the three pieces of state, filters the employees, and passes values + setters down to the children.",
    lines: src(`
import { useState } from "react";
import employees from "./employees.json";
import SearchInput from "./SearchInput";
import RoleSelect from "./RoleSelect";
import ActiveCheckbox from "./ActiveCheckbox";
import EmployeeList from "./EmployeeList";

function App() {
  const [searchText, setSearchText] = useState("");
  const [role, setRole] = useState("All");
  const [activeOnly, setActiveOnly] = useState(false);

  const filteredEmployees = employees.filter((emp) => {
    const matchesName = emp.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesRole = role === "All" || emp.role === role;
    const matchesActive = !activeOnly || emp.active;
    return matchesName && matchesRole && matchesActive;
  });

  return (
    <div>
      <h1>Employee List</h1>
      <SearchInput value={searchText} onChange={setSearchText} />
      <RoleSelect value={role} onChange={setRole} />
      <ActiveCheckbox checked={activeOnly} onChange={setActiveOnly} />
      <EmployeeList employees={filteredEmployees} />
    </div>
  );
}

export default App;
`),
    notes: [
      "<b>useState</b> is a named import from <b>react</b> (curly braces) — App is the only file that needs it, because all state lives here.",
      "The data, imported as a <b>default</b> import (no braces) straight from the JSON file — Vite turns the JSON array into a JavaScript array called <b>employees</b>.",
      "Child component #1, default import from <b>./SearchInput</b> — no <code>.jsx</code> needed in the path.",
      "Child component #2, the role dropdown.",
      "Child component #3, the checkbox.",
      "Child component #4 — the list. EmployeeCard is <b>not</b> imported here; EmployeeList imports it.",
      null,
      "A plain <b>function</b> component (not an arrow) — exported at the bottom with <code>export default App;</code>.",
      "State 1: the search box text. Starts as an empty string <code>\"\"</code> so <code>.toLowerCase()</code> works from the first render.",
      "State 2: the selected role. Starts as <b>\"All\"</b> — capital A, exactly matching the first <code>&lt;option value=\"All\"&gt;</code>.",
      "State 3: the checkbox. Starts as <b>false</b> (unchecked = show everyone).",
      null,
      "<b>filteredEmployees</b> is NOT state — it's recalculated on every render. <code>.filter</code> keeps an employee when the callback returns true; the callback's parameter is <b>emp</b>.",
      "Name check, split over three lines: start from <code>emp.name</code>…",
      "…lower-case it…",
      "…and check it <b>includes</b> the lower-cased search text. Lower-casing <b>both</b> sides makes the search case-insensitive. An empty search always matches.",
      "Role check: <b>\"All\"</b> lets everyone through; otherwise the employee's role must equal the selected role exactly. Note the <b>||</b>.",
      "Active check: <code>!activeOnly || emp.active</code>. Unchecked → <code>!false</code> is true, everyone passes. Checked → only <code>emp.active</code> passes.",
      "Keep the employee only if <b>all three</b> are true — joined with <b>&amp;&amp;</b>. Don't forget the <b>return</b>.",
      "Closes the arrow function <code>}</code> and the <code>.filter(</code> call <code>)</code>, then <code>;</code>.",
      null,
      "The JSX starts here.",
      "One wrapper <b>div</b>.",
      "Heading text: <b>Employee List</b>.",
      "Search box gets the current text as <b>value</b> and the setter itself as <b>onChange</b> — <code>setSearchText</code>, not <code>setSearchText()</code>.",
      "Dropdown gets <b>value={role}</b> and <b>onChange={setRole}</b> — same pattern.",
      "The checkbox is the odd one: its prop is <b>checked</b>, not value. <code>checked={activeOnly}</code>, <code>onChange={setActiveOnly}</code>.",
      "The list gets the <b>filtered</b> array under the prop name <b>employees</b> — passing the unfiltered <code>employees</code> would make the filters do nothing.",
      "Close the wrapper div.",
      "Close <code>return (</code>.",
      "Close the App function.",
      null,
      "Default export, so main.jsx can <code>import App from \"./App\"</code>."
    ]
  },
  {
    name: "SearchInput.jsx",
    lang: "jsx",
    role: "Controlled text input. Shows the value from App and sends every keystroke back up with onChange.",
    lines: src(`
function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search by name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default SearchInput;
`),
    notes: [
      "Props come in as <b>one object</b>; <code>{ value, onChange }</code> destructures it. The names match what App passes: <code>value={searchText} onChange={setSearchText}</code>.",
      "Return the JSX.",
      "A self-closing <b>input</b>, with its attributes on separate lines.",
      "<code>type=\"text\"</code> — a normal text box.",
      "Placeholder text: <b>Search by name</b>.",
      "<b>value={value}</b> — the box always shows App's searchText. This is what makes it <b>controlled</b>.",
      "On every keystroke, call the parent's setter with <b>e.target.value</b> (a string). Here <code>onChange</code> is really <code>setSearchText</code>.",
      "Self-close the input: <code>/&gt;</code>.",
      "Close <code>return (</code>.",
      "Close the function.",
      null,
      "Default export — App imports it without braces."
    ]
  },
  {
    name: "RoleSelect.jsx",
    lang: "jsx",
    role: "Controlled dropdown. Same pattern as SearchInput: value in, e.target.value out.",
    lines: src(`
function RoleSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="All">All</option>
      <option value="Developer">Developer</option>
      <option value="Designer">Designer</option>
      <option value="Manager">Manager</option>
    </select>
  );
}

export default RoleSelect;
`),
    notes: [
      "Same props as SearchInput: <code>{ value, onChange }</code>. App passes <code>value={role} onChange={setRole}</code>.",
      "Return the JSX.",
      "The <b>select</b> is controlled by <code>value={value}</code>, and sends the chosen option's value up with <code>e.target.value</code> — all on one line.",
      "First option <b>All</b> — its value must be exactly <code>\"All\"</code>, matching App's initial state and the <code>role === \"All\"</code> check.",
      "Each value must match the <b>role</b> field in employees.json exactly (case-sensitive): <b>Developer</b>…",
      "…<b>Designer</b>…",
      "…<b>Manager</b>. Order: All, Developer, Designer, Manager.",
      "Close the select.",
      "Close <code>return (</code>.",
      "Close the function.",
      null,
      "Default export."
    ]
  },
  {
    name: "ActiveCheckbox.jsx",
    lang: "jsx",
    role: "Controlled checkbox — the one input that differs: it uses checked and e.target.checked (a boolean).",
    lines: src(`
function ActiveCheckbox({ checked, onChange }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      Show only active employees
    </label>
  );
}

export default ActiveCheckbox;
`),
    notes: [
      "Props are <code>{ checked, onChange }</code> — <b>checked</b>, not value. App passes <code>checked={activeOnly} onChange={setActiveOnly}</code>.",
      "Return the JSX.",
      "Wrapped in a <b>label</b> so clicking the text also toggles the box.",
      "The input, attributes on the next lines.",
      "<code>type=\"checkbox\"</code>.",
      "<b>checked={checked}</b> controls a checkbox (not <code>value</code>).",
      "Send <b>e.target.checked</b> — <code>true</code> or <code>false</code>. (<code>e.target.value</code> on a checkbox is the string \"on\".)",
      "Self-close the input.",
      "Label text: <b>Show only active employees</b> — plain text inside the label, after the input.",
      "Close the label.",
      "Close <code>return (</code>.",
      "Close the function.",
      null,
      "Default export."
    ]
  },
  {
    name: "EmployeeList.jsx",
    lang: "jsx",
    role: "Shows the count, then either the empty message or the list — one EmployeeCard per employee.",
    lines: src(`
import EmployeeCard from "./EmployeeCard";

function EmployeeList({ employees }) {
  return (
    <div>
      <p>Total employees: {employees.length}</p>

      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <ul>
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default EmployeeList;
`),
    notes: [
      "EmployeeList is the file that imports <b>EmployeeCard</b> (default import).",
      null,
      "One prop, <b>employees</b> — the <b>filtered</b> array App passed in.",
      "Return the JSX.",
      "Wrapper div.",
      "Count line: <code>Total employees: {employees.length}</code> — arrays have <b>length</b>.",
      null,
      "A <b>ternary</b> inside braces: if the array is empty (<code>=== 0</code>)…",
      "…show <b>No employees found</b>…",
      "…otherwise ( <code>) : (</code> ) show the list.",
      "An unordered list <b>ul</b>.",
      "<code>.map</code> turns each <b>emp</b> into a card. Note the <code>(</code> after <code>=&gt;</code> — it returns JSX.",
      "Each card needs a <b>key</b> (<code>emp.id</code>) and gets the employee under the prop name <b>employee</b>.",
      "Close the map: <code>))}</code>.",
      "Close the ul.",
      "Close the ternary: <code>)}</code>.",
      "Close the wrapper div.",
      "Close <code>return (</code>.",
      "Close the function.",
      null,
      "Default export."
    ]
  },
  {
    name: "EmployeeCard.jsx",
    lang: "jsx",
    role: "One employee row: name | role | ₹salary | Active/Inactive.",
    lines: src(`
function EmployeeCard({ employee }) {
  return (
    <li>
      {employee.name} | {employee.role} | ₹{employee.salary} |{" "}
      {employee.active ? "Active" : "Inactive"}
    </li>
  );
}

export default EmployeeCard;
`),
    notes: [
      "One prop, <b>employee</b> — matching <code>employee={emp}</code> in EmployeeList.",
      "Return the JSX.",
      "Each card is an <b>li</b> (it sits inside EmployeeList's ul).",
      "Name, role and salary separated by <b>|</b>, with <b>₹</b> before the salary. The <code>{\" \"}</code> at the end keeps a space — JSX drops the line break, so without it you'd get <code>|Active</code>. (When typing, the ₹ is optional.)",
      "A ternary: <code>employee.active ? \"Active\" : \"Inactive\"</code>.",
      "Close the li.",
      "Close <code>return (</code>.",
      "Close the function.",
      null,
      "Default export."
    ]
  }
];

/* shown in Study → "How the files connect" */
export const FLOW = [
  "<b>App.jsx</b> imports the array from <code>employees.json</code> and keeps three pieces of state: <code>searchText</code> (\"\"), <code>role</code> (\"All\"), <code>activeOnly</code> (false).",
  "Every render it builds <code>filteredEmployees</code> with <code>.filter</code>: name includes the search (case-insensitive) <b>&amp;&amp;</b> role matches or is \"All\" <b>&amp;&amp;</b> active if the box is ticked.",
  "Values and setters go <b>down</b> as props: <code>SearchInput</code> and <code>RoleSelect</code> get <code>value</code> + <code>onChange</code>; <code>ActiveCheckbox</code> gets <code>checked</code> + <code>onChange</code>.",
  "Children send changes <b>up</b> by calling <code>onChange(e.target.value)</code> — or <code>onChange(e.target.checked)</code> for the checkbox.",
  "<code>EmployeeList</code> gets the filtered array, shows the count and either \"No employees found\" or one <code>EmployeeCard</code> per employee (<code>key={emp.id}</code>, <code>employee={emp}</code>).",
  "<code>employees.json</code> (not drilled): 5 objects with <code>id, name, role, salary, active</code> — Riya, Rohan, Sneha, Vikram, Anjali."
];

/* Token blanks + first letters */
export const BLANK_CHUNKS = [
  { f: 0, from: 0, to: 5, label: "imports" },
  { f: 0, from: 7, to: 10, label: "the three useState lines" },
  { f: 0, from: 12, to: 19, label: "the filter" },
  { f: 0, from: 21, to: 32, label: "JSX & export" },
  { f: 1, from: 0, to: 11, label: "whole file" },
  { f: 2, from: 0, to: 11, label: "whole file" },
  { f: 3, from: 0, to: 13, label: "whole file" },
  { f: 4, from: 0, to: 9, label: "count & empty message" },
  { f: 4, from: 9, to: 20, label: "the list & export" },
  { f: 5, from: 0, to: 9, label: "whole file" }
];

/* Line order + swapped lines */
export const ORDER_CHUNKS = [
  { f: 0, from: 0, to: 10, label: "imports & state" },
  { f: 0, from: 12, to: 19, label: "the filter" },
  { f: 0, from: 21, to: 32, label: "JSX & export" },
  { f: 1, from: 0, to: 11, label: "whole file" },
  { f: 2, from: 0, to: 11, label: "whole file" },
  { f: 3, from: 0, to: 13, label: "whole file" },
  { f: 4, from: 0, to: 20, label: "whole file" },
  { f: 5, from: 0, to: 9, label: "whole file" }
];

/* Bug hunt. Each bug replaces exactly one line. `why` explains the failure. */
export const BUGS = [
  // App.jsx
  { f: 0, line: 0, bad: 'import { useState } from "react-dom";', why: "useState comes from <b>react</b>, not react-dom." },
  { f: 0, line: 0, bad: 'import useState from "react";', why: "useState is a <b>named</b> export — it needs curly braces: <code>import { useState }</code>." },
  { f: 0, line: 1, bad: 'import { employees } from "./employees.json";', why: "A JSON file is imported as a <b>default</b> import — no braces." },
  { f: 0, line: 2, bad: 'import SearchInput from "./searchInput";', why: "File paths are case-sensitive on the server — the file is <b>SearchInput</b>.jsx." },
  { f: 0, line: 5, bad: 'import { EmployeeList } from "./EmployeeList";', why: "EmployeeList is a <b>default</b> export, so it's imported without braces." },
  { f: 0, line: 8, bad: "const [searchText, setSearchText] = useState();", why: "Without <code>\"\"</code>, searchText starts as <b>undefined</b> and <code>searchText.toLowerCase()</code> crashes on the first render." },
  { f: 0, line: 8, bad: 'const [setSearchText, searchText] = useState("");', why: "useState returns <b>[value, setter]</b> — value first." },
  { f: 0, line: 9, bad: 'const [role, setRole] = useState("all");', why: "Must be <b>\"All\"</b> with a capital A. With \"all\", <code>role === \"All\"</code> is false and nobody's role is \"all\" — the list starts empty." },
  { f: 0, line: 10, bad: "const [activeOnly, setActiveOnly] = useState(true);", why: "The box should start <b>unchecked</b> — <code>useState(false)</code> — so everyone shows at first." },
  { f: 0, line: 12, bad: "const filteredEmployees = employees.map((emp) => {", why: "<b>map</b> would return an array of true/false. <b>filter</b> keeps the employees whose callback returns true." },
  { f: 0, line: 13, bad: "const matchesName = emp.Name", why: "The JSON field is <b>name</b> (lower-case). <code>emp.Name</code> is undefined, so <code>.toLowerCase()</code> crashes." },
  { f: 0, line: 14, bad: ".toUpperCase()", why: "One side upper-cased and the other lower-cased never match. Both sides use <b>toLowerCase</b>." },
  { f: 0, line: 15, bad: ".includes(searchText);", why: "Lower-case the search text too — <code>searchText.toLowerCase()</code> — or typing \"Riya\" with a capital R finds nothing." },
  { f: 0, line: 16, bad: 'const matchesRole = role === "All" && emp.role === role;', why: "Needs <b>||</b>. With &amp;&amp;, \"All\" would also require the employee's role to be \"All\" — nobody matches." },
  { f: 0, line: 16, bad: "const matchesRole = emp.role === role;", why: "Missing <code>role === \"All\" ||</code>, so choosing All shows nobody." },
  { f: 0, line: 17, bad: "const matchesActive = activeOnly || emp.active;", why: "Missing the <b>!</b>. Unchecked would hide inactive employees and checked would show everyone — backwards." },
  { f: 0, line: 17, bad: "const matchesActive = !activeOnly && emp.active;", why: "Needs <b>||</b>. With &amp;&amp; an unchecked box still hides inactive employees and a checked box hides everyone." },
  { f: 0, line: 18, bad: "return matchesName || matchesRole || matchesActive;", why: "All three conditions must hold — join them with <b>&amp;&amp;</b>." },
  { f: 0, line: 18, bad: "matchesName && matchesRole && matchesActive;", why: "Missing <b>return</b>. The callback returns undefined, so filter keeps nobody." },
  { f: 0, line: 23, bad: "<h1>Employee List<h1>", why: "The closing tag needs a slash: <code>&lt;/h1&gt;</code>." },
  { f: 0, line: 24, bad: "<SearchInput value={searchText} onChange={searchText} />", why: "onChange must be the <b>setter</b>, <code>setSearchText</code>. A string makes the child's <code>onChange(...)</code> throw \"onChange is not a function\"." },
  { f: 0, line: 24, bad: "<SearchInput value={searchText} onChange={setSearchText()} />", why: "<code>setSearchText()</code> runs during render — pass the function itself: <code>onChange={setSearchText}</code>." },
  { f: 0, line: 25, bad: "<RoleSelect value={role} setRole={setRole} />", why: "RoleSelect reads a prop called <b>onChange</b>; a prop named setRole is ignored, so choosing a role throws." },
  { f: 0, line: 26, bad: "<ActiveCheckbox value={activeOnly} onChange={setActiveOnly} />", why: "ActiveCheckbox reads <b>checked</b>, not value — the box would never show App's state." },
  { f: 0, line: 27, bad: "<EmployeeList employees={employees} />", why: "Pass <b>filteredEmployees</b>. The raw <code>employees</code> means search and filters do nothing." },
  { f: 0, line: 32, bad: "export { App };", why: "Must be a <b>default</b> export — <code>export default App;</code> — because it's imported as <code>import App from \"./App\"</code>." },

  // SearchInput.jsx
  { f: 1, line: 0, bad: "function SearchInput(value, onChange) {", why: "Props arrive as <b>one object</b>. Destructure it: <code>function SearchInput({ value, onChange })</code>." },
  { f: 1, line: 0, bad: "function SearchInput({ text, onChange }) {", why: "App passes the prop as <b>value</b>, not text — so <code>text</code> is undefined." },
  { f: 1, line: 3, bad: "type=text", why: "JSX attribute strings need quotes: <code>type=\"text\"</code>." },
  { f: 1, line: 5, bad: 'value="value"', why: "That's the literal string \"value\". Use the prop in braces: <code>value={value}</code>." },
  { f: 1, line: 6, bad: "onChange={(e) => onChange(e.value)}", why: "The typed text is <code>e.<b>target</b>.value</code>. <code>e.value</code> is undefined." },
  { f: 1, line: 6, bad: "onChange={onChange(e.target.value)}", why: "This runs immediately during render, where <code>e</code> doesn't exist. Wrap it: <code>(e) =&gt; onChange(e.target.value)</code>." },
  { f: 1, line: 6, bad: "onChange={(e) => onChange(e.target.checked)}", why: "<b>checked</b> is for checkboxes. A text box needs <b>e.target.value</b>." },
  { f: 1, line: 7, bad: ">", why: "In JSX an input must be self-closed: <code>/&gt;</code>." },
  { f: 1, line: 11, bad: "export default searchInput;", why: "Case matters — the component is <b>SearchInput</b>; <code>searchInput</code> isn't defined." },

  // RoleSelect.jsx
  { f: 2, line: 0, bad: "function RoleSelect({ role, onChange }) {", why: "App passes <b>value</b>, not role — <code>role</code> would be undefined." },
  { f: 2, line: 2, bad: "<select value={value} onChange={(e) => onChange(e.target.checked)}>", why: "A select gives its choice through <b>e.target.value</b>." },
  { f: 2, line: 2, bad: '<select value="All" onChange={(e) => onChange(e.target.value)}>', why: "Hard-coding <code>\"All\"</code> locks the dropdown on All. Show the prop: <code>value={value}</code>." },
  { f: 2, line: 3, bad: '<option value="all">All</option>', why: "The value must be <b>\"All\"</b> exactly — App checks <code>role === \"All\"</code>." },
  { f: 2, line: 4, bad: '<option value="Developers">Developer</option>', why: "The value must match the JSON role exactly — <b>\"Developer\"</b>, singular." },
  { f: 2, line: 6, bad: '<option value="Manager">Manager<option>', why: "The closing tag is <code>&lt;/option&gt;</code>." },
  { f: 2, line: 7, bad: "</selected>", why: "Close with <code>&lt;/select&gt;</code>, the tag that was opened." },

  // ActiveCheckbox.jsx
  { f: 3, line: 0, bad: "function ActiveCheckbox({ value, onChange }) {", why: "App passes <b>checked</b>, so destructure <code>{ checked, onChange }</code>." },
  { f: 3, line: 2, bad: "<lable>", why: "Typo — it's <b>label</b>, matching the closing <code>&lt;/label&gt;</code>." },
  { f: 3, line: 4, bad: 'type="check"', why: "The type is <b>\"checkbox\"</b>. \"check\" isn't a type, so a text box appears." },
  { f: 3, line: 5, bad: "value={checked}", why: "A checkbox is controlled with <b>checked</b>, not value." },
  { f: 3, line: 6, bad: "onChange={(e) => onChange(e.target.value)}", why: "A checkbox's value is the string <b>\"on\"</b> — always truthy, so it can never be unticked. Use <b>e.target.checked</b>." },
  { f: 3, line: 7, bad: ">", why: "Self-close the input: <code>/&gt;</code>." },

  // EmployeeList.jsx
  { f: 4, line: 0, bad: 'import { EmployeeCard } from "./EmployeeCard";', why: "EmployeeCard is a <b>default</b> export — no braces." },
  { f: 4, line: 2, bad: "function EmployeeList(employees) {", why: "That names the whole props object \"employees\". Destructure: <code>{ employees }</code>." },
  { f: 4, line: 5, bad: "<p>Total employees: {employees.size}</p>", why: "Arrays have <b>length</b>, not size." },
  { f: 4, line: 5, bad: "<p>Total employees: employees.length</p>", why: "Without braces JSX prints the words \"employees.length\". Use <code>{employees.length}</code>." },
  { f: 4, line: 7, bad: "{employees.length = 0 ? (", why: "A single <b>=</b> assigns — it empties the array! Compare with <b>===</b>." },
  { f: 4, line: 10, bad: "<ol>", why: "It's a <b>ul</b> — the closing tag is <code>&lt;/ul&gt;</code>, so &lt;ol&gt; won't compile." },
  { f: 4, line: 11, bad: "{employees.forEach((emp) => (", why: "<b>forEach</b> returns undefined, so nothing renders. Use <b>map</b>." },
  { f: 4, line: 12, bad: "<EmployeeCard employee={emp} />", why: "List items need a <b>key</b> — <code>key={emp.id}</code>." },
  { f: 4, line: 12, bad: "<EmployeeCard key={emp.id} emp={emp} />", why: "EmployeeCard reads a prop called <b>employee</b>." },
  { f: 4, line: 12, bad: "<EmployeeCard key={emp.id} employee={employees} />", why: "Pass the single <b>emp</b>, not the whole array." },
  { f: 4, line: 20, bad: "export default EmployeeCard;", why: "This file exports <b>EmployeeList</b>." },

  // EmployeeCard.jsx
  { f: 5, line: 0, bad: "function EmployeeCard({ emp }) {", why: "EmployeeList passes the prop as <b>employee</b>." },
  { f: 5, line: 0, bad: "function EmployeeCard(employee) {", why: "Destructure the props object: <code>{ employee }</code>. Otherwise <code>employee.name</code> is undefined." },
  { f: 5, line: 3, bad: "{employee.name} | {employee.role} | ₹{employee.salary} |", why: "Missing <code>{\" \"}</code>. JSX drops the line break, so the row would end <code>|Active</code> with no space." },
  { f: 5, line: 3, bad: "{name} | {role} | ₹{salary} |{\" \"}", why: "<code>name</code>, <code>role</code> and <code>salary</code> aren't variables here — read them from <b>employee</b>." },
  { f: 5, line: 4, bad: '{employee.active ? "Inactive" : "Active"}', why: "Backwards — true should show <b>\"Active\"</b>." },
  { f: 5, line: 4, bad: '{employee.active ? "Active"}', why: "A ternary needs both parts: <code>? \"Active\" : \"Inactive\"</code>." },
  { f: 5, line: 9, bad: "export EmployeeCard;", why: "Must be <code>export <b>default</b> EmployeeCard;</code>." }
];

/* Concept quiz. `a` is the index of the right option. */
export const QUIZ = [
  { f: 0, q: "Where does all the state live?", opts: ["In each child component", "In App", "In EmployeeList", "In employees.json"], a: 1, exp: "App holds searchText, role and activeOnly; the children just receive props." },
  { f: 0, q: "How many <code>useState</code> calls are in App?", opts: ["1", "2", "3", "4"], a: 2, exp: "searchText, role, activeOnly." },
  { f: 0, q: "What is the initial value of <code>role</code>?", opts: ["\"\"", "\"all\"", "\"All\"", "null"], a: 2, exp: "<code>useState(\"All\")</code> — capital A, matching the first option's value." },
  { f: 0, q: "What is the initial value of <code>activeOnly</code>?", opts: ["true", "false", "\"\"", "\"on\""], a: 1, exp: "Unchecked at first, so everyone is shown." },
  { f: 0, q: "Is <code>filteredEmployees</code> state?", opts: ["Yes, it uses useState", "No — it's recalculated from state on every render", "Yes, it's stored in employees.json", "It's a prop"], a: 1, exp: "It's derived data — a plain const computed with <code>.filter</code> each render." },
  { f: 0, q: "Why call <code>toLowerCase()</code> on both the name and the search text?", opts: ["To sort the names", "To make the search case-insensitive", "Because includes needs lower case", "To trim spaces"], a: 1, exp: "\"riya\", \"Riya\" and \"RIYA\" all match." },
  { f: 0, q: "When <code>role</code> is \"All\", what does <code>role === \"All\" || emp.role === role</code> give?", opts: ["true for everyone", "false for everyone", "true only for Developers", "An error"], a: 0, exp: "The left side is already true, so || short-circuits to true." },
  { f: 0, q: "With the box <b>unchecked</b>, what does <code>!activeOnly || emp.active</code> give?", opts: ["true only for active employees", "true for everyone", "false for everyone", "true only for inactive employees"], a: 1, exp: "<code>!false</code> is true, so everyone passes." },
  { f: 0, q: "With the box <b>checked</b>, who passes <code>!activeOnly || emp.active</code>?", opts: ["Everyone", "Only active employees", "Only inactive employees", "Nobody"], a: 1, exp: "<code>!true</code> is false, so it comes down to <code>emp.active</code>." },
  { f: 0, q: "How are the three checks combined?", opts: ["||", "&&", "??", "A ternary"], a: 1, exp: "<code>return matchesName &amp;&amp; matchesRole &amp;&amp; matchesActive;</code>" },
  { f: 0, q: "What is passed as SearchInput's <code>onChange</code>?", opts: ["setSearchText()", "setSearchText", "searchText", "(e) => e.target.value"], a: 1, exp: "The setter itself — the child calls it later with the new text." },
  { f: 0, q: "Which prop name does App use for the checkbox's state?", opts: ["value", "active", "checked", "activeOnly"], a: 2, exp: "<code>&lt;ActiveCheckbox checked={activeOnly} onChange={setActiveOnly} /&gt;</code>" },
  { f: 0, q: "What does App pass to EmployeeList?", opts: ["The raw employees array", "filteredEmployees, as the prop employees", "searchText", "The setters"], a: 1, exp: "<code>&lt;EmployeeList employees={filteredEmployees} /&gt;</code>" },
  { f: 0, q: "How is employees.json imported?", opts: ["import { employees } from \"./employees.json\"", "import employees from \"./employees.json\"", "fetch(\"./employees.json\")", "require(\"employees\")"], a: 1, exp: "A default import — no braces." },
  { f: 0, q: "What is the heading text?", opts: ["Employees", "Employee List", "Employee Directory", "Staff"], a: 1, exp: "<code>&lt;h1&gt;Employee List&lt;/h1&gt;</code>" },
  { f: 0, q: "Which component is NOT imported by App?", opts: ["SearchInput", "RoleSelect", "EmployeeCard", "EmployeeList"], a: 2, exp: "EmployeeList imports EmployeeCard." },
  { f: 1, q: "What does SearchInput send up on each keystroke?", opts: ["e.target.checked", "e.target.value", "e.value", "the whole event"], a: 1, exp: "<code>onChange={(e) =&gt; onChange(e.target.value)}</code>" },
  { f: 1, q: "What is the placeholder text?", opts: ["Search", "Search by name", "Search employees", "Type a name"], a: 1, exp: "<code>placeholder=\"Search by name\"</code>" },
  { f: 1, q: "What makes the search box a <b>controlled</b> input?", opts: ["type=\"text\"", "value={value} plus an onChange that updates the state", "The placeholder", "Wrapping it in a label"], a: 1, exp: "The box always shows state, and every change goes back to state." },
  { f: 1, q: "Inside SearchInput, what actually is <code>onChange</code>?", opts: ["A React built-in", "App's setSearchText, passed down as a prop", "The input's own handler", "A new state setter"], a: 1, exp: "Calling <code>onChange(text)</code> really calls <code>setSearchText(text)</code>." },
  { f: 2, q: "What are the four option values, in order?", opts: ["All, Developer, Designer, Manager", "all, developer, designer, manager", "Developer, Designer, Manager, All", "All, Developers, Designers, Managers"], a: 0, exp: "The role strings from the JSON, with \"All\" first." },
  { f: 2, q: "Why must the option values match the JSON exactly?", opts: ["For styling", "The filter uses strict, case-sensitive ===", "React requires it", "They don't have to"], a: 1, exp: "<code>emp.role === role</code> — \"developer\" ≠ \"Developer\"." },
  { f: 2, q: "Where does <code>value={value}</code> go in RoleSelect?", opts: ["On each option", "On the select", "On a label", "Nowhere"], a: 1, exp: "<code>&lt;select value={value} onChange={…}&gt;</code>" },
  { f: 3, q: "Which event property does the checkbox read?", opts: ["e.target.value", "e.target.checked", "e.checked", "e.target.active"], a: 1, exp: "A boolean — true when ticked." },
  { f: 3, q: "What is <code>e.target.value</code> on a checkbox?", opts: ["true/false", "The string \"on\"", "undefined", "1/0"], a: 1, exp: "That's why the checkbox must use <code>checked</code>." },
  { f: 3, q: "Why is the checkbox wrapped in a <code>&lt;label&gt;</code>?", opts: ["For colour", "So clicking the text also toggles the box", "React requires it", "To send the value"], a: 1, exp: "The text and the box act as one control." },
  { f: 3, q: "What is the label text?", opts: ["Active only", "Show only active employees", "Show active", "Only active"], a: 1, exp: "It comes after the input, inside the label." },
  { f: 4, q: "What shows when no employee matches?", opts: ["Nothing", "No employees found", "0 results", "Empty list"], a: 1, exp: "<code>&lt;p&gt;No employees found&lt;/p&gt;</code>" },
  { f: 4, q: "Which line shows the count?", opts: ["<p>Count: {employees.length}</p>", "<p>Total employees: {employees.length}</p>", "<p>{employees.size} employees</p>", "<h2>Total: {employees.length}</h2>"], a: 1, exp: "Arrays have <b>length</b>." },
  { f: 4, q: "What picks between the empty message and the list?", opts: ["&&", "A ternary ? :", "if/else", "switch"], a: 1, exp: "<code>{employees.length === 0 ? ( … ) : ( … )}</code>" },
  { f: 4, q: "What is each card's <code>key</code>?", opts: ["emp.name", "the index", "emp.id", "emp.role"], a: 2, exp: "<code>key={emp.id}</code>" },
  { f: 4, q: "Under which prop name is the employee passed to EmployeeCard?", opts: ["emp", "employee", "data", "item"], a: 1, exp: "<code>employee={emp}</code>" },
  { f: 4, q: "How does data move between the components?", opts: ["Children change App's variables directly", "Values go down as props; changes come up through the onChange callbacks", "Through employees.json", "Through a global store"], a: 1, exp: "That's the whole pattern of Problem 3." },
  { f: 5, q: "What does <code>{\" \"}</code> at the end of the line do?", opts: ["Nothing", "Keeps a space before Active/Inactive, since JSX drops the line break", "Adds a new line", "It's required syntax"], a: 1, exp: "Without it the row reads <code>|Active</code>." },
  { f: 5, q: "What separates the fields in a row?", opts: [",", "-", "|", "/"], a: 2, exp: "<code>{employee.name} | {employee.role} | ₹{employee.salary} |</code>" },
  { f: 5, q: "What does an inactive employee show?", opts: ["Disabled", "Inactive", "No", "Nothing"], a: 1, exp: "<code>employee.active ? \"Active\" : \"Inactive\"</code>" },
  { f: 5, q: "Which element is each card?", opts: ["div", "li", "p", "tr"], a: 1, exp: "An <code>&lt;li&gt;</code> inside EmployeeList's <code>&lt;ul&gt;</code>." }
];
