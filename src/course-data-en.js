export const courseDays = [
  {
    day: 1,
    navTitle: "Turn ideas into tasks",
    title: "Turn a product idea into executable tasks",
    summary:
      "Do not start with code. Learn to turn a vague product idea into development work that Codex can understand, execute, and verify.",
    duration: "90 minutes",
    outcome: "Write the TaskFlow requirements and use Codex to produce a runnable first page.",
    objectives: [
      "Understand Projects, Threads, Workspaces, and permissions",
      "Use the Goal, Context, Constraints, and Done when prompt structure",
      "Ask Codex to inspect, plan, implement, and then verify",
      "Verify outcomes in the browser instead of judging code volume"
    ],
    concepts: [
      {
        title: "You are not memorizing code",
        body:
          "Your job is to define product outcomes, provide business context, identify risks, and accept the result. Codex reads files, writes code, runs commands, and fixes issues, but you remain responsible for the final judgment."
      },
      {
        title: "Four parts of a reliable task",
        body:
          "Goal states the result. Context identifies users, scenarios, and relevant files. Constraints limit technology, safety, and scope. Done when provides observable completion criteria."
      },
      {
        title: "When to use Plan mode",
        body:
          "Plan first when requirements are unclear, technical choices have major consequences, or several modules will change. A small, explicit copy change can usually be implemented directly."
      }
    ],
    steps: [
      ["Set the goal", "Describe the user problem in one sentence"],
      ["Define the user", "State the target user and core scenario"],
      ["List the MVP", "Keep only what version one truly needs"],
      ["Write acceptance", "Make every criterion observable and testable"],
      ["Delegate to Codex", "Inspect, plan, implement, and verify"]
    ],
    prompt: `You are a senior full-stack engineer. Build a task-management web app in the current project.

Goal:
Let an individual user create, edit, complete, and delete tasks.

User and scenario:
- The user is a knowledge worker managing daily work
- The core scenario is quickly capturing tasks and seeing unfinished work

Version-one features:
- Display a task list
- Create a task
- Toggle completion
- Delete a task
- Filter by status

Constraints:
- Inspect the current directory and available environment first
- Explain the technical approach before implementation
- Keep the interface simple and support mobile screens
- Do not add complex features outside the request

Done when:
- The project starts locally with a documented command
- Every button works
- Tasks persist after refresh
- Desktop and mobile layouts are verified in a browser
- The final response explains the changes and verification evidence`,
    exercise: [
      "Create a project folder and confirm Codex's working directory",
      "Write TaskFlow requirements using the four-part structure",
      "Ask Codex to identify assumptions before implementation",
      "Have Codex create the first page",
      "Create, complete, and delete one task in the browser"
    ],
    acceptance: [
      "Requirements include the target user and MVP",
      "The prompt contains constraints and completion criteria",
      "The project starts with a clear command",
      "The core task flow works in a browser",
      "You can name at least one assumption Codex made"
    ],
    deliverables: ["requirements.md", "First Codex prompt", "Runnable task-list page"],
    tip: "Define the business outcome before discussing frameworks. A framework is a means, not the requirement."
  },
  {
    day: 2,
    navTitle: "Build a reliable UI",
    title: "Understand the frontend and build a reliable interface",
    summary:
      "Learn the roles of HTML, CSS, JavaScript, and components. You do not need to write everything from scratch, but you must recognize structure and report UI defects precisely.",
    duration: "120 minutes",
    outcome: "Build a responsive task page with a form, filters, empty states, and clear feedback.",
    objectives: [
      "Understand the separate roles of HTML, CSS, and JavaScript",
      "Understand React components, Props, and State at a practical level",
      "Report UI issues with screenshots, element names, and expected behavior",
      "Require browser verification on desktop and mobile"
    ],
    concepts: [
      {
        title: "Three frontend layers",
        body:
          "HTML describes structure, CSS controls layout and appearance, and JavaScript manages interactions and state. React organizes the page into reusable components that render from state."
      },
      {
        title: "Do not say only “it looks bad”",
        body:
          "Name the page, region, element, desired change, and verification. For example: at 390 px, the create button must not overflow and the form should stack vertically."
      },
      {
        title: "Establish a design system first",
        body:
          "Colors, typography, spacing, radii, and control states should follow shared rules. Ask Codex to define tokens and components before implementation to reduce visual drift."
      }
    ],
    steps: [
      ["Identify structure", "Header, Sidebar, Main, Form, and TaskList"],
      ["Define states", "Empty, loading, success, error, and disabled"],
      ["Build components", "Split by responsibility"],
      ["Check responsive UI", "Verify desktop and 390 px mobile"],
      ["Regression test", "Repeat the core flow after each change"]
    ],
    prompt: `Improve the frontend experience of the current task-management app.

Before changing code:
1. Read the existing code and explain the component structure.
2. List the files you plan to modify.

Implement:
- A create-task form with title and priority
- All, Active, and Completed filters
- A clear empty state
- Visible success and error feedback
- Keyboard-operable forms and buttons

Visual constraints:
- Use shared color, spacing, radius, and typography rules
- Do not introduce a UI framework that conflicts with the project
- No horizontal scrolling at 390 px

After implementation:
- Start the project
- Verify create, filter, complete, and delete in a browser
- Check desktop and mobile sizes
- Report the problems found and fixed`,
    exercise: [
      "Ask Codex to explain the page components and state",
      "Add task priority input and display",
      "Add empty, error, and success states",
      "Inspect the page at 390 px",
      "Give one precise browser-based revision request"
    ],
    acceptance: [
      "You can distinguish structure, styling, and interaction issues",
      "The page contains at least three reusable components",
      "Filters and form state actually work",
      "Keyboard focus is clearly visible",
      "There is no horizontal overflow on mobile"
    ],
    deliverables: ["Component map", "Responsive task page", "Browser verification notes"],
    tip: "Feedback formula: location + element + current problem + desired result + verification."
  },
  {
    day: 3,
    navTitle: "Connect a backend API",
    title: "Connect the frontend to a backend API",
    summary:
      "Move from temporary browser data to real client-server collaboration. Understand requests, responses, HTTP methods, and status codes.",
    duration: "120 minutes",
    outcome: "Read and modify tasks through a REST API with consistent error handling.",
    objectives: [
      "Understand frontend, backend, and API boundaries",
      "Use GET, POST, PATCH, and DELETE appropriately",
      "Define an API contract before coding",
      "Use logs and the Network panel to diagnose requests"
    ],
    concepts: [
      {
        title: "An API is a collaboration contract",
        body:
          "The frontend does not need to know how data is stored, and the backend does not need to know how it is displayed. They coordinate through paths, methods, fields, responses, and status codes."
      },
      {
        title: "Define the contract first",
        body:
          "Specify each endpoint's input, success response, failure response, and authorization before asking Codex to implement both sides."
      },
      {
        title: "Errors are normal outcomes",
        body:
          "400 means invalid input, 401 unauthenticated, 403 forbidden, 404 missing resource, and 500 an internal failure. The UI must turn these into understandable feedback."
      }
    ],
    steps: [
      ["Design the resource", "Define Task fields and statuses"],
      ["Define endpoints", "Method, path, body, and response"],
      ["Build the backend", "Validate input and return stable JSON"],
      ["Connect the frontend", "Handle loading, success, and error"],
      ["Inspect requests", "Verify with Network and logs"]
    ],
    prompt: `Add a REST API to TaskFlow and connect the existing frontend to it.

First produce an API contract table containing:
- GET /api/tasks
- POST /api/tasks
- PATCH /api/tasks/:id
- DELETE /api/tasks/:id

For every endpoint document:
- Parameters or request body
- Success response
- Possible error responses
- HTTP status codes

Implementation constraints:
- Validate title, status, and priority on the server
- Use one consistent JSON error structure
- Show loading, empty, and error states in the UI
- Preserve useful server-side error context in logs

Verification:
- Exercise every endpoint with tests or commands
- Verify the complete task flow in the browser
- Compare the final implementation with the API contract`,
    exercise: [
      "Define the Task model and four endpoint contracts",
      "Ask Codex to implement an in-memory API",
      "Replace frontend localStorage access with API calls",
      "Submit an empty title and inspect the 400 response",
      "Explain one request using the Network panel"
    ],
    acceptance: [
      "All four endpoints have explicit contracts",
      "Frontend data comes from the API",
      "The server rejects invalid input",
      "Errors use a consistent response format",
      "You can explain one request and response"
    ],
    deliverables: ["api-contract.md", "Task REST API", "Integration notes"],
    tip: "For API bugs, give Codex the request, response, logs, and exact reproduction steps together."
  },
  {
    day: 4,
    navTitle: "Database and business rules",
    title: "Persist data and enforce business rules",
    summary:
      "Use your SQL strength to understand the application data layer: schema, migrations, constraints, queries, and where business logic belongs.",
    duration: "120 minutes",
    outcome: "Persist tasks in a database with sound constraints, migrations, and seed data.",
    objectives: [
      "Understand database migrations and seeds",
      "Separate database constraints, backend validation, and UI feedback",
      "Review Codex-generated schemas and queries",
      "Prevent destructive changes to production data"
    ],
    concepts: [
      {
        title: "Schema is part of the product rules",
        body:
          "Types, nullability, uniqueness, foreign keys, and indexes directly affect product behavior. Use your SQL experience to review these choices rather than delegating them blindly."
      },
      {
        title: "Migrations track structural change",
        body:
          "Do not manually edit a shared database. Describe each schema change in a migration so local, test, and production environments can reproduce it."
      },
      {
        title: "Three layers protect data",
        body:
          "The frontend gives early feedback, the backend enforces complete business validation, and the database guarantees final consistency."
      }
    ],
    steps: [
      ["Design the schema", "Task, User, fields, and constraints"],
      ["Create migrations", "Make structural changes reproducible"],
      ["Prepare seed data", "Support demos and tests"],
      ["Replace storage", "Read and write through the database"],
      ["Test constraints", "Invalid values, foreign keys, deletion"]
    ],
    prompt: `Migrate the current task API from memory storage to a database.

Before implementation:
- Read the current Task type and API contract
- Propose a schema and explain fields, constraints, and indexes
- Review the schema for consistency before changing code

Requirements:
- Choose the best database option for the existing stack
- Manage every schema change through migrations
- Provide repeatable seed data
- Separate data-access code from HTTP handlers
- Preserve the existing API contract
- Do not run destructive commands that delete existing data

Tests:
- Migrations run against an empty database
- Seeded tasks can be read
- Data remains after a server restart
- Empty titles and invalid statuses cannot be stored
- Existing tests pass and database tests are added`,
    exercise: [
      "Review the proposed Task schema",
      "Add status and ownership constraints",
      "Run migrations and seed data",
      "Restart the server and confirm persistence",
      "Attempt to store an invalid status"
    ],
    acceptance: [
      "Migrations can rebuild the database structure",
      "Seed data can be generated repeatedly",
      "The API contract survives the storage change",
      "Important fields have database constraints",
      "No irreversible data-deletion operation was used"
    ],
    deliverables: ["Database schema", "Migrations and seed", "Database tests"],
    tip: "Stop and review any DROP, reset, production override, or destructive command before approval."
  },
  {
    day: 5,
    navTitle: "Login, access, and security",
    title: "Add login, authorization, and basic security",
    summary:
      "Make tasks belong to real users. Distinguish Authentication from Authorization and review common security risks.",
    duration: "150 minutes",
    outcome: "Users can register, sign in, and sign out, while accessing only their own tasks.",
    objectives: [
      "Distinguish authentication from authorization",
      "Understand sessions, cookies, and password hashing",
      "Require server-side authorization on protected APIs",
      "Perform one cross-user access test"
    ],
    concepts: [
      {
        title: "Authentication is not authorization",
        body:
          "Login proves who you are. Authorization decides what you may do. A signed-in user must not be allowed to read an arbitrary task ID."
      },
      {
        title: "Security cannot depend on the UI",
        body:
          "Hiding a button does not stop direct API calls. The backend must check the current user for every protected resource operation."
      },
      {
        title: "Do not invent authentication algorithms",
        body:
          "Prefer established libraries and framework patterns. Hash passwords and configure HttpOnly, Secure, and SameSite cookie properties appropriately."
      }
    ],
    steps: [
      ["Choose a solution", "Use a mature option for the framework"],
      ["Create users", "Register, sign in, sign out, and session"],
      ["Assign tasks", "Store an ownerId on every task"],
      ["Protect endpoints", "Check current user and ownership"],
      ["Test attacks", "Reject unauthenticated and cross-user access"]
    ],
    prompt: `Add user authentication and resource authorization to TaskFlow.

Security requirements:
- Prefer a mature, actively maintained solution for the current framework
- Never store plaintext passwords or write them to logs
- Configure secure session cookies appropriately
- Check the current user in every task API
- Users may read, update, and delete only their own tasks
- Never commit secrets to Git

Implementation order:
1. Explain the authentication flow and threat boundary.
2. List database changes and environment variables.
3. Implement registration, sign-in, and sign-out.
4. Add Task ownership and protect every endpoint.
5. Add tests for unauthenticated access, wrong passwords, and cross-user access.

Finish with a security review covering:
- IDOR and broken object authorization
- Password and log leakage
- Input validation
- Cookie configuration
- Internal detail exposure in errors`,
    exercise: [
      "Ask Codex to diagram the authenticated request flow",
      "Create two test users and separate tasks",
      "Verify an unauthenticated request returns 401",
      "Try to access user B's task as user A",
      "Search the repository for accidental secrets"
    ],
    acceptance: [
      "Passwords use a mature hashing algorithm",
      "Unauthenticated users cannot call task APIs",
      "Users can operate only on their own tasks",
      "Sensitive configuration uses environment variables",
      "Security tests cover cross-user access"
    ],
    deliverables: ["Authentication flow", "Login and authorization", "Security test report"],
    tip: "For every new resource endpoint, ask: how does the server prove this user may operate on it?"
  },
  {
    day: 6,
    navTitle: "Debug, test, Git, deploy",
    title: "Debug, test, use Git, and deploy",
    summary:
      "Move from “it works on my machine” to evidence-backed reliability and a safe release process.",
    duration: "150 minutes",
    outcome: "Pass core tests, record changes clearly in Git, and deploy to an accessible environment.",
    objectives: [
      "Debug with minimal reproduction, logs, and browser tools",
      "Understand unit, integration, and end-to-end test boundaries",
      "Use status, diff, commit, and branch",
      "Understand environment variables, builds, and deployment checks"
    ],
    concepts: [
      {
        title: "Reproduce before fixing",
        body:
          "Give Codex exact steps, expected behavior, actual behavior, logs, requests, and environment details. Without stable reproduction, a fix is usually a guess."
      },
      {
        title: "Tests are acceptance evidence",
        body:
          "Unit tests check small functions, integration tests check modules and databases, and end-to-end tests verify real browser workflows."
      },
      {
        title: "Git is a recoverable work record",
        body:
          "Review the diff before committing, include only related files, and explain why the change exists. Never commit .env files, local databases, or build artifacts."
      }
    ],
    steps: [
      ["Reproduce", "Record steps, input, environment, and error"],
      ["Locate the layer", "Frontend, network, backend, database"],
      ["Add regression tests", "Prevent the same bug from returning"],
      ["Review the diff", "Remove unrelated or sensitive changes"],
      ["Verify deployment", "Repeat the core flow online"]
    ],
    prompt: `Run a release-readiness review of TaskFlow and fix the issues you find.

Review:
- Lint, type checks, build, and all tests
- Register, sign in, create, complete, and sign out end-to-end
- Core pages at mobile width
- User-friendly feedback for failed requests
- Environment variables and .gitignore
- Deployment-safe database migrations

Working method:
- Run checks and record original failures before changing code
- Explain root cause, fix, and evidence for every issue
- Keep each fix narrowly scoped
- Never delete or skip a failing test to create a green result
- Review git diff at the end

Deliver:
- Test summary
- Required environment variables without real secrets
- Deployment and rollback steps
- Online smoke-test checklist`,
    exercise: [
      "Create a reproducible form defect",
      "Use logs to have Codex locate and fix it",
      "Add a regression test",
      "Review git status and diff",
      "Run an online smoke test after deployment"
    ],
    acceptance: [
      "The defect has clear reproduction and root cause",
      "The core flow has automated tests",
      "The diff contains no secrets or unrelated files",
      "Deployment variables are documented",
      "The online core task flow works"
    ],
    deliverables: ["Test report", "Focused Git commit", "Deploy and rollback guide", "Public URL"],
    tip: "Do not accept “it should work.” Ask for command output, browser results, or test reports."
  },
  {
    day: 7,
    navTitle: "Independent delivery and exam",
    title: "Deliver independently and complete the final exam",
    summary:
      "Stop following step-by-step instructions. Organize Codex independently, clarify the requirements, and deliver a runnable, tested, deployable feature.",
    duration: "180 minutes",
    outcome: "Complete the final TaskFlow iteration and score at least 90 points.",
    objectives: [
      "Turn an ambiguous request into an execution plan",
      "Correct Codex during implementation",
      "Accept work through tests, browser behavior, and diff review",
      "Explain how the Web workflow transfers to mini programs and apps"
    ],
    concepts: [
      {
        title: "Manage the complete loop",
        body:
          "Requirements, planning, implementation, verification, review, and release are all required. Generating a page is not the same as delivering a product."
      },
      {
        title: "The shell changes across platforms",
        body:
          "WeChat Mini Programs, React Native, and Flutter have different UI and release systems, but requirement breakdown, APIs, databases, authentication, tests, and version control remain reusable."
      },
      {
        title: "90 points means independent delivery",
        body:
          "The exam does not test syntax memorization. It tests whether you can direct Codex, detect mistakes, verify quality, and explain critical decisions."
      }
    ],
    steps: [
      ["Read the brief", "Find functional, quality, security, and delivery needs"],
      ["Create a plan", "Have Codex investigate and phase the work"],
      ["Implement in stages", "Verify after every stage"],
      ["Review actively", "Check authorization, errors, tests, and diff"],
      ["Submit evidence", "Run steps, test results, and explanation"]
    ],
    prompt: `This is an independent practical exam. Read the requirements, but do not modify code immediately.

In phase one only:
1. Inspect the repository and environment.
2. Break the request into independently verifiable tasks.
3. Identify assumptions, risks, and security concerns.
4. Provide implementation, testing, and deployment plans.

After the plan is approved, execute in stages. Every stage must:
- Name the files that will change
- Complete the implementation
- Run relevant checks
- Prove completion with observable evidence
- Report unresolved issues

Finally, run the full test suite, browser core flow, and git diff review.`,
    exercise: [
      "Add due dates and an overdue filter",
      "Add server validation and a database migration",
      "Ensure users see only their own overdue tasks",
      "Add automated tests",
      "Deploy and submit complete acceptance evidence"
    ],
    acceptance: [
      "Planning precedes implementation",
      "Frontend, API, and database changes stay consistent",
      "Authorization and error paths are verified",
      "Automated and browser tests pass",
      "The final delivery includes deployment and review evidence"
    ],
    deliverables: ["Exam project", "Acceptance evidence", "Technical review", "Retrospective"],
    tip: "The exam measures whether you can direct Codex, not whether you can handwrite the app without it."
  }
];

export const examQuestions = [
  {
    id: "q1",
    type: "choice",
    points: 4,
    question: "Which prompt is most likely to produce a verifiable result?",
    options: [
      "Build me a beautiful task website",
      "Write a task page with React",
      "Implement task filters, keep the existing stack, and verify All, Active, and Completed at desktop and 390 px widths",
      "Use popular websites as inspiration and decide freely"
    ],
    answer: 2,
    explanation: "It defines the goal, constraints, and observable completion criteria."
  },
  {
    id: "q2",
    type: "choice",
    points: 4,
    question: "User A can read user B's task by changing the URL. What is missing?",
    options: ["Frontend routing", "Server-side resource authorization", "CSS hiding", "A database index"],
    answer: 1,
    explanation: "Authentication proves identity; the server must still authorize access to the resource."
  },
  {
    id: "q3",
    type: "choice",
    points: 4,
    question: "An online form fails intermittently. What should you do first?",
    options: [
      "Ask Codex to rewrite the form",
      "Remove error handling",
      "Collect stable reproduction steps, inputs, logs, requests, and responses",
      "Replace the frontend framework"
    ],
    answer: 2,
    explanation: "Reliable debugging begins with reproduction and evidence."
  },
  {
    id: "q4",
    type: "choice",
    points: 4,
    question: "How should a new database field be synchronized across environments?",
    options: ["Tell the team verbally", "Edit production directly", "Commit a repeatable migration", "Delete the old database"],
    answer: 2,
    explanation: "Migrations make structural changes traceable and repeatable."
  },
  {
    id: "q5",
    type: "choice",
    points: 4,
    question: "What is the strongest evidence that a feature is complete?",
    options: [
      "Codex says it is complete",
      "The repository contains more code",
      "Relevant tests pass and the browser flow matches acceptance criteria",
      "The page opens"
    ],
    answer: 2,
    explanation: "Completion requires verification evidence that covers the requirement."
  }
];

export const practicalRubric = [
  ["Requirements and plan", 15, "Clear breakdown, assumptions, risks, constraints, and completion criteria"],
  ["Frontend experience", 15, "Due-date input, overdue state, filters, mobile layout, and error feedback work"],
  ["API and database", 15, "Contract, validation, migration, query, and fields remain consistent"],
  ["Authorization and security", 15, "Server limits resources by current user; unauthenticated and cross-user tests pass"],
  ["Testing and debugging", 10, "Critical automated tests and evidence from failure to fix"],
  ["Git and deployment", 5, "Focused diff, no secrets, deployment guide, and online checks"],
  ["Explanation and review", 5, "Explains technical decisions, Codex mistakes, and corrections"]
];

export const expansionPaths = [
  {
    title: "WeChat Mini Program",
    subtitle: "Reuse the backend, replace the client shell",
    points: ["Learn WXML, WXSS, and mini-program components", "Handle WeChat login and platform permissions", "Test in developer tools and on a device", "Complete privacy and release review"]
  },
  {
    title: "Cross-platform app",
    subtitle: "React Native or Flutter",
    points: ["Reuse product requirements, APIs, and database", "Adapt touch, navigation, and local storage", "Add native features such as push and camera", "Handle signing and store releases"]
  },
  {
    title: "Keep improving",
    subtitle: "From delivery to reliable delivery",
    points: ["Learn basic JavaScript and code reading", "Create project-level AGENTS.md", "Turn repeated workflows into Skills and prompts", "Add monitoring, performance, and security review"]
  }
];
