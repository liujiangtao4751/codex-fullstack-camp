import {
  courseDays as zhCourseDays,
  examQuestions as zhExamQuestions,
  expansionPaths as zhExpansionPaths,
  practicalRubric as zhPracticalRubric
} from "./course-data.js";
import {
  courseDays as enCourseDays,
  examQuestions as enExamQuestions,
  expansionPaths as enExpansionPaths,
  practicalRubric as enPracticalRubric
} from "./course-data-en.js";

const state = {
  activeDay: Number(localStorage.getItem("codex-camp-active-day") || 1),
  completed: JSON.parse(localStorage.getItem("codex-camp-completed") || "{}"),
  answers: JSON.parse(localStorage.getItem("codex-camp-exam-answers") || "{}"),
  language: localStorage.getItem("codex-camp-language") === "en" ? "en" : "zh",
  examSubmitted: false,
  mobileNavOpen: false
};

const contentByLanguage = {
  zh: {
    courseDays: zhCourseDays,
    examQuestions: zhExamQuestions,
    expansionPaths: zhExpansionPaths,
    practicalRubric: zhPracticalRubric
  },
  en: {
    courseDays: enCourseDays,
    examQuestions: enExamQuestions,
    expansionPaths: enExpansionPaths,
    practicalRubric: enPracticalRubric
  }
};

let { courseDays, examQuestions, expansionPaths, practicalRubric } =
  contentByLanguage[state.language];

const ui = {
  zh: {
    appName: "Codex 全栈训练营",
    openNav: "打开课程目录",
    backDayOne: "返回第一天",
    totalProgress: "总体学习进度",
    dayProgress: (day) => `第 ${day} 天`,
    continue: "继续学习",
    outline: "课程大纲",
    sevenDayCourse: "7 天课程",
    principles: "学习原则",
    principleItems: ["先定义结果", "分阶段执行", "始终要求验证", "用证据验收"],
    resetProgress: "重置学习进度",
    concepts: "必要概念",
    conceptsSub: "只学习足以做出正确判断的部分。",
    method: "工作方法",
    methodSub: "把今天的任务拆成五个可验证步骤。",
    outcome: "今日产出",
    promptTemplate: "Codex Prompt 模板",
    promptSub: "先理解结构，再根据你的项目修改。",
    copyPrompt: "复制 Prompt",
    project: "贯穿项目：TaskFlow",
    projectSub: "每天向同一个任务管理应用增加一层真实能力。",
    myTasks: "我的任务",
    today: "今天",
    completedNav: "已完成",
    settings: "设置",
    newTask: "+ 新建任务",
    all: "全部",
    active: "进行中",
    completed: "已完成",
    priority: "优先级",
    previewTasks: [
      ["完成登录页面验收", "高", "进行中"],
      ["定义 Task API 契约", "中", "待开始"],
      ["增加数据库 migration", "中", "待开始"]
    ],
    practice: "动手实践",
    practiceSub: "完成并勾选，每项都需要实际证据。",
    doneCount: (done, total) => `${done} / ${total} 已完成`,
    task: "任务",
    expand: "Web 之后如何扩展",
    expandSub: "复用已经掌握的产品与工程方法。",
    finalExam: "综合考试 · 100 分",
    examSub: "知识理解 20 分 + 独立实操 80 分，90 分视为掌握。",
    knowledge: "知识理解",
    practical: "综合实操",
    passLine: "通过线",
    knowledgeQuestions: "知识理解题",
    knowledgeQuestionsSub: "共 5 题，每题 4 分。提交后自动评分。",
    points: "分",
    retry: "重新作答",
    submit: "提交知识题",
    practicalExam: "综合实操题",
    practicalExamSub: "在 TaskFlow 中增加“截止日期与逾期任务”能力。",
    requirements: "任务要求",
    practicalBrief: "用户可以为任务设置截止日期；任务逾期后有明确视觉提示；可以筛选“已逾期”任务。前端、API、数据库、权限和测试必须保持一致，并部署到可访问环境。",
    rubricDimension: "评分维度",
    rubricPoints: "分值",
    rubricEvidence: "满分证据",
    reference: "参考答案与阅卷说明",
    referenceSub: "完成考试后再展开",
    knowledgeAnswers: "知识题答案",
    implementationPath: "实操题参考实施路径",
    implementationSteps: [
      "先调研仓库，明确当前 Task 字段、API 契约、用户权限和测试结构。",
      "定义 dueDate 的格式、时区、是否必填以及“逾期”的业务规则。",
      "通过 migration 增加可为空的截止日期字段，并更新 seed 与类型定义。",
      "更新创建、修改、列表和逾期筛选 API，保持服务端输入校验和用户范围限制。",
      "更新表单、任务行、筛选和空状态，验证桌面与手机布局。",
      "增加日期边界、非法日期、跨用户访问和逾期筛选测试。",
      "执行完整检查、审查 diff、部署并在线上重复核心流程。"
    ],
    deduction: "扣分原则",
    deductionText: "只有界面没有数据层最多得 30 分；没有服务端权限检查不得超过 70 分；没有验证证据不得超过 80 分；存在敏感信息泄露或破坏性数据操作直接判定不通过。",
    todayGoal: "今日目标",
    duration: "预计时间",
    learningProgress: "学习进度",
    itemCount: (done, total) => `${done} / ${total} 项`,
    acceptance: "验收标准",
    deliverables: "今日交付物",
    coachTip: "教练提示",
    practiceDone: "实践任务已完成",
    practiceUndone: "已取消完成状态",
    promptCopied: (day) => `Day ${day} Prompt 已复制`,
    unanswered: (count) => `还有 ${count} 道题未作答`,
    resetConfirm: "确定清除全部学习进度和考试答案吗？",
    progressReset: "学习进度已重置"
  },
  en: {
    appName: "Codex Camp",
    openNav: "Open course outline",
    backDayOne: "Return to Day 1",
    totalProgress: "Overall learning progress",
    dayProgress: (day) => `Day ${day}`,
    continue: "Continue",
    outline: "Course outline",
    sevenDayCourse: "7-day course",
    principles: "Learning principles",
    principleItems: ["Define outcomes first", "Work in stages", "Always verify", "Accept with evidence"],
    resetProgress: "Reset progress",
    concepts: "Essential concepts",
    conceptsSub: "Learn only what you need to make sound decisions.",
    method: "Working method",
    methodSub: "Break today's work into five verifiable steps.",
    outcome: "Today's outcome",
    promptTemplate: "Codex prompt template",
    promptSub: "Understand the structure, then adapt it to your project.",
    copyPrompt: "Copy prompt",
    project: "Course project: TaskFlow",
    projectSub: "Add one real capability to the same task app every day.",
    myTasks: "My tasks",
    today: "Today",
    completedNav: "Completed",
    settings: "Settings",
    newTask: "+ New task",
    all: "All",
    active: "Active",
    completed: "Completed",
    priority: "priority",
    previewTasks: [
      ["Accept the login page", "High", "Active"],
      ["Define the Task API contract", "Medium", "Not started"],
      ["Add a database migration", "Medium", "Not started"]
    ],
    practice: "Hands-on practice",
    practiceSub: "Complete each item and collect real evidence.",
    doneCount: (done, total) => `${done} / ${total} completed`,
    task: "Task",
    expand: "Where to go after Web",
    expandSub: "Reuse the product and engineering methods you now know.",
    finalExam: "Final exam · 100 points",
    examSub: "Knowledge 20 + practical delivery 80. A score of 90 demonstrates mastery.",
    knowledge: "Knowledge",
    practical: "Practical delivery",
    passLine: "Pass score",
    knowledgeQuestions: "Knowledge questions",
    knowledgeQuestionsSub: "5 questions, 4 points each. Scored automatically.",
    points: "pts",
    retry: "Try again",
    submit: "Submit answers",
    practicalExam: "Practical exam",
    practicalExamSub: "Add due dates and overdue tasks to TaskFlow.",
    requirements: "Requirements",
    practicalBrief: "Users can set task due dates, see a clear overdue state, and filter overdue tasks. Frontend, API, database, authorization, and tests must remain consistent, and the result must be deployed.",
    rubricDimension: "Dimension",
    rubricPoints: "Points",
    rubricEvidence: "Full-score evidence",
    reference: "Reference answer and grading guide",
    referenceSub: "Open after completing the exam",
    knowledgeAnswers: "Knowledge answers",
    implementationPath: "Reference implementation path",
    implementationSteps: [
      "Inspect the repository and identify Task fields, API contracts, authorization, and tests.",
      "Define dueDate format, time zone, nullability, and the business rule for overdue tasks.",
      "Add a nullable due-date field through a migration and update seeds and types.",
      "Update create, edit, list, and overdue-filter APIs with validation and user scoping.",
      "Update forms, task rows, filters, and empty states; verify desktop and mobile.",
      "Add date-boundary, invalid-date, cross-user, and overdue-filter tests.",
      "Run all checks, review the diff, deploy, and repeat the core flow online."
    ],
    deduction: "Deduction rules",
    deductionText: "A UI without a data layer can score at most 30; missing server authorization caps the score at 70; missing verification evidence caps it at 80; secrets exposure or destructive data operations result in failure.",
    todayGoal: "Today's goal",
    duration: "Estimated time",
    learningProgress: "Learning progress",
    itemCount: (done, total) => `${done} / ${total} items`,
    acceptance: "Acceptance criteria",
    deliverables: "Deliverables",
    coachTip: "Coach tip",
    practiceDone: "Practice item completed",
    practiceUndone: "Completion removed",
    promptCopied: (day) => `Day ${day} prompt copied`,
    unanswered: (count) => `${count} question${count === 1 ? "" : "s"} unanswered`,
    resetConfirm: "Clear all learning progress and exam answers?",
    progressReset: "Learning progress reset"
  }
};

function t(key, ...args) {
  const value = ui[state.language][key];
  return typeof value === "function" ? value(...args) : value;
}

function applyLanguage() {
  ({ courseDays, examQuestions, expansionPaths, practicalRubric } =
    contentByLanguage[state.language]);
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  document.title = t("appName");
}

const icons = {
  arrow: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5.5 5.5-5.5 5.5"/></svg>`,
  check: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10.5 3.5 3.5L16 5.5"/></svg>`,
  clipboard: `<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6" y="5" width="9" height="11" rx="1.5"/><path d="M9 5V3.5h3V5M4.5 13H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2"/></svg>`,
  clock: `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 1.5"/></svg>`,
  close: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>`,
  menu: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/></svg>`,
  play: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 5 7 5-7 5Z"/></svg>`,
  reset: `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7V3m0 0h4M4 3l3 3a6 6 0 1 1-1.2 8.3"/></svg>`
};

const app = document.querySelector("#app");

function saveState() {
  localStorage.setItem("codex-camp-active-day", String(state.activeDay));
  localStorage.setItem("codex-camp-completed", JSON.stringify(state.completed));
  localStorage.setItem("codex-camp-exam-answers", JSON.stringify(state.answers));
  localStorage.setItem("codex-camp-language", state.language);
}

function getTaskKey(day, index) {
  return `${day}-${index}`;
}

function getDayProgress(day) {
  const data = courseDays[day - 1];
  const done = data.exercise.filter((_, index) => state.completed[getTaskKey(day, index)]).length;
  return { done, total: data.exercise.length, percent: Math.round((done / data.exercise.length) * 100) };
}

function getCourseProgress() {
  const totals = courseDays.reduce(
    (result, day) => {
      result.total += day.exercise.length;
      result.done += day.exercise.filter(
        (_, index) => state.completed[getTaskKey(day.day, index)]
      ).length;
      return result;
    },
    { done: 0, total: 0 }
  );
  return { ...totals, percent: Math.round((totals.done / totals.total) * 100) };
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderShell() {
  applyLanguage();
  const courseProgress = getCourseProgress();
  const day = courseDays[state.activeDay - 1];

  app.innerHTML = `
    <header class="topbar">
      <button class="icon-button mobile-menu" data-action="toggle-nav" aria-label="${t("openNav")}">
        ${state.mobileNavOpen ? icons.close : icons.menu}
      </button>
      <div class="brand-zone">
        <button class="brand" data-action="go-day" data-day="1" aria-label="${t("backDayOne")}">
          <span class="brand-mark">C</span>
          <span>${t("appName")}</span>
        </button>
        <button class="language-switch ${state.language === "en" ? "is-en" : ""}" data-action="toggle-language" aria-label="中文 / English" aria-pressed="${state.language === "en"}">
          <span>中</span><i></i><span>EN</span>
        </button>
      </div>
      <div class="top-progress" aria-label="${t("totalProgress")}">
        <strong>${t("dayProgress", state.activeDay)} <span>/ 7</span></strong>
        <div class="day-dots">
          ${courseDays
            .map((item) => {
              const progress = getDayProgress(item.day);
              return `<span class="${item.day === state.activeDay ? "active" : ""} ${
                progress.percent === 100 ? "complete" : ""
              }"></span>`;
            })
            .join("")}
        </div>
        <small>${courseProgress.percent}%</small>
      </div>
      <button class="primary-button" data-action="next-day" ${state.activeDay === 7 ? "disabled" : ""}>
        ${t("continue")} ${icons.arrow}
      </button>
    </header>
    <div class="app-grid">
      ${renderSidebar()}
      <main class="lesson" id="main-content">
        ${state.activeDay === 7 ? renderDaySeven(day) : renderLesson(day)}
      </main>
      ${renderContextRail(day)}
    </div>
    <div class="nav-scrim ${state.mobileNavOpen ? "show" : ""}" data-action="toggle-nav"></div>
  `;

  bindEvents();
}

function renderSidebar() {
  return `
    <aside class="sidebar ${state.mobileNavOpen ? "open" : ""}">
      <div class="sidebar-label">${t("outline")}</div>
      <nav aria-label="${t("sevenDayCourse")}">
        ${courseDays
          .map((day) => {
            const progress = getDayProgress(day.day);
            return `
              <button class="day-link ${day.day === state.activeDay ? "active" : ""}" data-action="go-day" data-day="${day.day}">
                <span class="day-copy">
                  <small>Day ${day.day}</small>
                  <strong>${day.navTitle}</strong>
                </span>
                <span class="day-status ${progress.percent === 100 ? "complete" : ""}">
                  ${progress.percent === 100 ? icons.check : ""}
                </span>
              </button>
            `;
          })
          .join("")}
      </nav>
      <div class="sidebar-resources">
        <div class="sidebar-label">${t("principles")}</div>
        <ul>
          ${t("principleItems").map((item, index) => `<li><span>0${index + 1}</span>${item}</li>`).join("")}
        </ul>
      </div>
      <button class="reset-button" data-action="reset-progress">${icons.reset} ${t("resetProgress")}</button>
    </aside>
  `;
}

function renderLesson(day) {
  return `
    <article>
      <div class="lesson-kicker">DAY ${String(day.day).padStart(2, "0")} / CODEX FULL-STACK</div>
      <h1>Day ${day.day}：${day.title}</h1>
      <p class="lesson-summary">${day.summary}</p>
      ${renderObjectives(day)}
      <section class="content-section">
        <div class="section-heading">
          <span>01</span>
          <div><h2>${t("concepts")}</h2><p>${t("conceptsSub")}</p></div>
        </div>
        <div class="concept-list">
          ${day.concepts
            .map(
              (concept, index) => `
                <div class="concept-row">
                  <span class="concept-number">${String(index + 1).padStart(2, "0")}</span>
                  <h3>${concept.title}</h3>
                  <p>${concept.body}</p>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
      <section class="content-section">
        <div class="section-heading">
          <span>02</span>
          <div><h2>${t("method")}</h2><p>${t("methodSub")}</p></div>
        </div>
        <div class="method-flow">
          ${day.steps
            .map(
              ([title, detail], index) => `
                <div class="method-step">
                  <span>${index + 1}</span>
                  <strong>${title}</strong>
                  <p>${detail}</p>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
      ${renderPrompt(day)}
      ${renderProjectPreview(day.day)}
      ${renderExercise(day)}
      ${renderExpansion(day.day)}
    </article>
  `;
}

function renderObjectives(day) {
  return `
    <section class="objective-band">
      <div>
        <span class="band-label">${t("outcome")}</span>
        <p>${day.outcome}</p>
      </div>
      <ul>
        ${day.objectives.map((item) => `<li>${icons.check}<span>${item}</span></li>`).join("")}
      </ul>
    </section>
  `;
}

function renderPrompt(day) {
  return `
    <section class="content-section">
      <div class="section-heading">
        <span>03</span>
        <div><h2>${t("promptTemplate")}</h2><p>${t("promptSub")}</p></div>
      </div>
      <div class="prompt-frame">
        <div class="prompt-toolbar">
          <span><i></i><i></i><i></i></span>
          <strong>day-${day.day}-prompt.md</strong>
          <button data-action="copy-prompt" data-day="${day.day}">${icons.clipboard} ${t("copyPrompt")}</button>
        </div>
        <pre><code>${escapeHtml(day.prompt)}</code></pre>
      </div>
    </section>
  `;
}

function renderProjectPreview(dayNumber) {
  const labels = t("previewTasks");
  const activeIndex = Math.min(Math.max(dayNumber - 1, 0), 2);
  return `
    <section class="content-section project-section">
      <div class="section-heading">
        <span>04</span>
        <div><h2>${t("project")}</h2><p>${t("projectSub")}</p></div>
      </div>
      <div class="task-app-preview">
        <aside>
          <div class="preview-logo"><span>✓</span> TaskFlow</div>
          <button class="selected">${t("myTasks")}</button>
          <button>${t("today")}</button>
          <button>${t("completedNav")}</button>
          <button>${t("settings")}</button>
        </aside>
        <div class="preview-main">
          <div class="preview-title">
            <div><small>PRODUCT BUILD</small><h3>${t("myTasks")}</h3></div>
            <button>${t("newTask")}</button>
          </div>
          <div class="preview-tabs"><span class="active">${t("all")}</span><span>${t("active")}</span><span>${t("completed")}</span></div>
          <div class="preview-list">
            ${labels
              .map(
                ([title, priority, status], index) => `
                  <div class="preview-task ${index === activeIndex ? "highlight" : ""}">
                    <span class="fake-check ${index < dayNumber - 4 ? "done" : ""}"></span>
                    <strong>${title}</strong>
                    <small>${priority} ${t("priority")}</small>
                    <em>${status}</em>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderExercise(day) {
  const progress = getDayProgress(day.day);
  return `
    <section class="content-section exercise-section">
      <div class="section-heading">
        <span>05</span>
        <div><h2>${t("practice")}</h2><p>${t("practiceSub")}</p></div>
      </div>
      <div class="exercise-header">
        <strong>${t("doneCount", progress.done, progress.total)}</strong>
        <div class="mini-progress"><span style="width:${progress.percent}%"></span></div>
      </div>
      <div class="exercise-list">
        ${day.exercise
          .map((task, index) => {
            const key = getTaskKey(day.day, index);
            const checked = Boolean(state.completed[key]);
            return `
              <label class="exercise-item ${checked ? "checked" : ""}">
                <input type="checkbox" data-action="toggle-task" data-key="${key}" ${checked ? "checked" : ""}>
                <span class="custom-check">${checked ? icons.check : ""}</span>
                <span><small>${t("task")} ${String(index + 1).padStart(2, "0")}</small>${task}</span>
              </label>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderExpansion(dayNumber) {
  if (dayNumber !== 6) return "";
  return `
    <section class="content-section">
      <div class="section-heading">
        <span>06</span>
        <div><h2>${t("expand")}</h2><p>${t("expandSub")}</p></div>
      </div>
      <div class="expansion-grid">
        ${expansionPaths
          .map(
            (path) => `
              <article>
                <small>${path.subtitle}</small>
                <h3>${path.title}</h3>
                <ul>${path.points.map((point) => `<li>${point}</li>`).join("")}</ul>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderDaySeven(day) {
  return `
    <article>
      <div class="lesson-kicker">FINAL DAY / 100 POINTS</div>
      <h1>Day 7：${day.title}</h1>
      <p class="lesson-summary">${day.summary}</p>
      ${renderObjectives(day)}
      ${renderPrompt(day)}
      ${renderExercise(day)}
      ${renderExam()}
      ${renderReferenceAnswer()}
    </article>
  `;
}

function renderExam() {
  const result = getExamResult();
  return `
    <section class="content-section exam-section">
      <div class="section-heading">
        <span>06</span>
        <div><h2>${t("finalExam")}</h2><p>${t("examSub")}</p></div>
      </div>
      <div class="score-map">
        <div><strong>20</strong><span>${t("knowledge")}</span></div>
        <div><strong>80</strong><span>${t("practical")}</span></div>
        <div class="pass-line"><strong>90</strong><span>${t("passLine")}</span></div>
      </div>
      <div class="exam-block">
        <div class="exam-block-title"><span>A</span><div><h3>${t("knowledgeQuestions")}</h3><p>${t("knowledgeQuestionsSub")}</p></div></div>
        ${examQuestions
          .map(
            (question, questionIndex) => `
              <fieldset class="question ${state.examSubmitted ? (state.answers[question.id] === question.answer ? "correct" : "wrong") : ""}">
                <legend><span>${questionIndex + 1}</span>${question.question}<em>${question.points} ${t("points")}</em></legend>
                <div class="options">
                  ${question.options
                    .map(
                      (option, optionIndex) => `
                        <label>
                          <input type="radio" name="${question.id}" value="${optionIndex}" data-action="answer" data-question="${question.id}" ${
                            Number(state.answers[question.id]) === optionIndex ? "checked" : ""
                          }>
                          <span>${String.fromCharCode(65 + optionIndex)}</span>
                          ${option}
                        </label>
                      `
                    )
                    .join("")}
                </div>
                ${
                  state.examSubmitted
                    ? `<p class="answer-note">${question.explanation}</p>`
                    : ""
                }
              </fieldset>
            `
          )
          .join("")}
        <div class="exam-actions">
          <button class="secondary-button" data-action="reset-exam">${t("retry")}</button>
          <button class="primary-button" data-action="submit-exam">${t("submit")}</button>
          ${
            state.examSubmitted
              ? `<div class="knowledge-score"><strong>${result}</strong><span>/ 20 ${t("points")}</span></div>`
              : ""
          }
        </div>
      </div>
      <div class="exam-block">
        <div class="exam-block-title"><span>B</span><div><h3>${t("practicalExam")}</h3><p>${t("practicalExamSub")}</p></div></div>
        <div class="practical-brief">
          <h4>${t("requirements")}</h4>
          <p>${t("practicalBrief")}</p>
        </div>
        <div class="rubric-table">
          <div class="rubric-head"><span>${t("rubricDimension")}</span><span>${t("rubricPoints")}</span><span>${t("rubricEvidence")}</span></div>
          ${practicalRubric
            .map(
              ([name, points, evidence]) => `
                <div class="rubric-row"><strong>${name}</strong><b>${points}</b><p>${evidence}</p></div>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderReferenceAnswer() {
  return `
    <details class="reference-answer content-section">
      <summary><span>07</span><div><strong>${t("reference")}</strong><small>${t("referenceSub")}</small></div>${icons.arrow}</summary>
      <div class="reference-body">
        <h3>${t("knowledgeAnswers")}</h3>
        <p>${examQuestions
          .map((question, index) => `${index + 1}. ${String.fromCharCode(65 + question.answer)}`)
          .join("　")}</p>
        <h3>${t("implementationPath")}</h3>
        <ol>
          ${t("implementationSteps").map((step) => `<li>${step.replace("dueDate", "<code>dueDate</code>")}</li>`).join("")}
        </ol>
        <h3>${t("deduction")}</h3>
        <p>${t("deductionText")}</p>
      </div>
    </details>
  `;
}

function renderContextRail(day) {
  const progress = getDayProgress(day.day);
  return `
    <aside class="context-rail">
      <section>
        <span class="rail-label">${t("todayGoal")}</span>
        <p>${day.outcome}</p>
      </section>
      <section class="rail-meta">
        <span class="rail-label">${t("duration")}</span>
        <p>${icons.clock}<strong>${day.duration}</strong></p>
      </section>
      <section>
        <span class="rail-label">${t("learningProgress")}</span>
        <div class="rail-progress"><span style="width:${progress.percent}%"></span></div>
        <p class="progress-copy"><strong>${progress.percent}%</strong><span>${t("itemCount", progress.done, progress.total)}</span></p>
      </section>
      <section>
        <span class="rail-label">${t("acceptance")}</span>
        <ul class="acceptance-list">
          ${day.acceptance
            .map((item, index) => {
              const done = index < progress.done;
              return `<li class="${done ? "done" : ""}"><span>${done ? icons.check : ""}</span>${item}</li>`;
            })
            .join("")}
        </ul>
      </section>
      <section>
        <span class="rail-label">${t("deliverables")}</span>
        <ul class="deliverable-list">
          ${day.deliverables.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>
      <div class="tip-box">
        <span>${t("coachTip")}</span>
        <p>${day.tip}</p>
      </div>
    </aside>
  `;
}

function getExamResult() {
  return examQuestions.reduce(
    (score, question) =>
      Number(state.answers[question.id]) === question.answer ? score + question.points : score,
    0
  );
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    const action = element.dataset.action;
    if (action === "go-day") {
      element.addEventListener("click", () => {
        state.activeDay = Number(element.dataset.day);
        state.mobileNavOpen = false;
        saveState();
        renderShell();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
    if (action === "next-day") {
      element.addEventListener("click", () => {
        if (state.activeDay < 7) state.activeDay += 1;
        saveState();
        renderShell();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
    if (action === "toggle-nav") {
      element.addEventListener("click", () => {
        state.mobileNavOpen = !state.mobileNavOpen;
        renderShell();
      });
    }
    if (action === "toggle-language") {
      element.addEventListener("click", () => {
        state.language = state.language === "zh" ? "en" : "zh";
        state.examSubmitted = false;
        saveState();
        renderShell();
      });
    }
    if (action === "toggle-task") {
      element.addEventListener("change", () => {
        state.completed[element.dataset.key] = element.checked;
        saveState();
        renderShell();
        showToast(element.checked ? t("practiceDone") : t("practiceUndone"));
      });
    }
    if (action === "copy-prompt") {
      element.addEventListener("click", async () => {
        const day = courseDays[Number(element.dataset.day) - 1];
        await navigator.clipboard.writeText(day.prompt);
        showToast(t("promptCopied", day.day));
      });
    }
    if (action === "answer") {
      element.addEventListener("change", () => {
        state.answers[element.dataset.question] = Number(element.value);
        state.examSubmitted = false;
        saveState();
      });
    }
    if (action === "submit-exam") {
      element.addEventListener("click", () => {
        const unanswered = examQuestions.filter((question) => state.answers[question.id] === undefined);
        if (unanswered.length) {
          showToast(t("unanswered", unanswered.length));
          return;
        }
        state.examSubmitted = true;
        renderShell();
        document.querySelector(".exam-section")?.scrollIntoView({ behavior: "smooth" });
      });
    }
    if (action === "reset-exam") {
      element.addEventListener("click", () => {
        state.answers = {};
        state.examSubmitted = false;
        saveState();
        renderShell();
      });
    }
    if (action === "reset-progress") {
      element.addEventListener("click", () => {
        if (!window.confirm(t("resetConfirm"))) return;
        state.completed = {};
        state.answers = {};
        state.examSubmitted = false;
        saveState();
        renderShell();
        showToast(t("progressReset"));
      });
    }
  });
}

applyLanguage();
renderShell();
