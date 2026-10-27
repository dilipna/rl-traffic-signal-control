import { SCENARIOS } from "./engine.js";
import "./style.css";
const names = {
  q: "Learned Q-policy",
  fixed: "Fixed timer",
  queue: "Queue-responsive",
};
const $ = (id) => document.getElementById(id);
const root = document.querySelector("#app");
root.innerHTML = `<header><a class="brand" href="#"><span class="brand-icon" aria-hidden="true">╋</span> phase<span class="brand-sub">TRAFFIC POLICY LAB</span></a><nav aria-label="Main navigation"><a href="#lab">The intersection</a><a href="#evidence">The evidence</a><a href="#method">The method</a><a href="https://github.com/dilipna/rl-traffic-signal-control/tree/improve/reproducible-traffic-lab" target="_blank" rel="noopener noreferrer">Source ↗</a></nav></header>
<main><section class="intro"><div><div class="eyebrow">ONE INTERSECTION. THREE WAYS TO THINK.</div><h1>Give every direction<br>its <em>turn.</em></h1><p>A timer follows a schedule. A rule follows the queue.<br>A learned policy follows experience. Put them on the same road.</p></div><aside class="intro-aside"><span class="light-mark" aria-hidden="true"><i></i><i></i><i></i></span><p>An interactive, synthetic two-road simulation.<br>No live traffic. No real-road control.</p></aside></section>
<section id="lab" aria-labelledby="lab-title"><div class="section-line"><h2 id="lab-title">Your intersection</h2><span>RUN LOCALLY IN YOUR BROWSER</span></div><div class="lab-grid"><aside class="controls"><div class="eyebrow">SET THE CONDITIONS</div><label for="scenario">What is happening?</label><select id="scenario">${Object.entries(
  SCENARIOS,
)
  .map(([id, s]) => `<option value="${id}">${s.name}</option>`)
  .join(
    "",
  )}</select><p id="scenario-help" class="hint"></p><label for="seed">Traffic seed</label><input id="seed" type="number" min="0" max="4294967295" step="1" value="123"><p class="hint">Same seed, same arrivals for every controller.</p><button id="run" class="primary">Run comparison ↗</button><button id="cancel" class="secondary" hidden>Cancel run</button><p id="status" role="status" aria-live="polite">Loading the frozen policy…</p><div class="control-rule"></div><div class="eyebrow">LOOK THROUGH A DIFFERENT LENS</div><label for="focus">Controller on the map</label><select id="focus"><option value="q">Learned Q-policy</option><option value="fixed">Fixed timer</option><option value="queue">Queue-responsive</option></select><p class="hint">All three are calculated. This changes the view, not the traffic.</p><div class="control-note"><strong>A fair comparison.</strong><p>Separate training and test seeds. Identical arrivals. Count every vehicle, including those that overflow the queue.</p></div></aside>
<div class="stage"><div class="stage-top"><span id="active-run">Waiting for a run</span><span id="phase-label">—</span></div><div class="intersection-wrap"><svg id="intersection" viewBox="0 0 600 440" role="img" aria-labelledby="map-title map-desc"><title id="map-title">Synthetic intersection queue schematic</title><desc id="map-desc">Run a comparison to display the two queues and signal phase. Up to sixteen vehicles are drawn per direction.</desc><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#353c4b" stroke-width=".5"/></pattern></defs><rect width="600" height="440" fill="#242a36"/><rect width="600" height="440" fill="url(#grid)"/><g fill="#303849" stroke="#50596b"><rect x="30" y="27" width="145" height="90" rx="9"/><rect x="415" y="27" width="155" height="90" rx="9"/><rect x="35" y="330" width="140" height="85" rx="9"/><rect x="420" y="330" width="140" height="85" rx="9"/></g><g fill="#1a202c"><rect x="210" width="180" height="440"/><rect y="140" width="600" height="160"/></g><g stroke="#687182" stroke-width="2" stroke-dasharray="9 11"><path d="M300 0v140M300 300v140M0 220h210M390 220h210"/></g><g stroke="#b0b9c8" stroke-width="4"><path d="M221 125h63M315 315h63M195 150v60M405 235v55"/></g><rect x="222" y="151" width="156" height="138" rx="15" fill="none" stroke="#677285" stroke-dasharray="3 7"/><g id="cars"></g><circle id="ns-light" cx="208" cy="128" r="8" fill="#a45555"/><circle id="ew-light" cx="405" cy="128" r="8" fill="#a45555"/><g fill="#d7dfeb" font-size="12" font-family="Arial"><text x="308" y="24">N</text><text x="308" y="426">S</text><text x="14" y="209">W</text><text x="572" y="209">E</text></g><g font-family="monospace" fill="#c6d0df" font-size="11"><text x="48" y="55">NORTH / SOUTH</text><text id="ns-count" x="48" y="83" font-size="24" fill="#e5bf71">0</text><text x="440" y="357">EAST / WEST</text><text id="ew-count" x="440" y="387" font-size="24" fill="#a5b1ed">0</text></g><text id="center-label" x="300" y="228" text-anchor="middle" fill="#e1e6ef" font-family="monospace" font-size="12">READY</text></svg></div><div class="playback"><button id="play" class="play" disabled>Play replay</button><label class="scrub-label" for="tick">Tick <span id="tick-count">0 / 239</span></label><input id="tick" type="range" min="0" max="239" step="1" value="0" disabled><button id="reset" class="text-button">Reset</button></div><p class="stage-caption">Queue schematic · up to 16 waiting vehicles drawn per direction · ticks are synthetic, not seconds</p><details class="decision-details"><summary>Why this signal?</summary><p id="decision">The completed replay records the requested action and simulator constraint.</p></details></div></div>
<div id="results" class="results" hidden><div class="results-head"><h3>Same traffic. Different decisions.</h3><span id="result-label"></span></div><div class="table-wrap" role="region" aria-label="Controller comparison, scroll horizontally if needed" tabindex="0"><table><thead><tr><th>Controller</th><th>Mean queue ↓</th><th>Served ↑</th><th>Overflow ↓</th><th>Still waiting</th><th>95th wait*</th></tr></thead><tbody id="metric-rows"></tbody></table></div><p class="hint">*Wait among served vehicles only. Unfinished queues and dropped vehicles are reported separately; a low served wait alone can hide poor performance.</p><div class="chart-panel"><div class="eyebrow">TOTAL QUEUE OVER THE RUN</div><svg id="chart" viewBox="0 0 1000 170" role="img" aria-label="Queue length trace for all three controllers"></svg><div class="legend"><span class="q">Learned Q-policy</span><span class="fixed">Fixed timer</span><span class="queue">Queue-responsive</span></div></div><div class="export-row"><button id="receipt" class="primary">Download run receipt</button><button id="notes" class="secondary">Download comparison notes</button><button id="share" class="text-button">Copy this experiment</button></div><p id="share-fallback" class="hint" hidden></p></div></section>
<section id="evidence"><div class="section-line"><h2>The results we kept.</h2><span>20 HELD-OUT ARRIVAL SEEDS / SCENARIO</span></div><div class="evidence-intro"><h3>Learning doesn’t<br>always win.</h3><div><p>One frozen Q-learning run. Five scenarios. Three controllers. All 300 evaluation runs stay visible, including losses.</p><p class="hint">Lower mean queue is better, but always read overflow and throughput alongside it. Confidence intervals describe variation across these arrival seeds, not real-road performance or training-seed uncertainty.</p><a href="/evidence/evaluation.json" download>Download the full evaluation ↗</a> <a href="/evidence/protocol.json" download>Frozen protocol ↗</a></div></div><div id="evidence-table" class="table-wrap" role="region" aria-label="Held-out evaluation results" tabindex="0"></div><p class="hint">Difference = learned minus fixed mean queue. Negative favors learned; positive favors fixed. Intervals are paired-seed percentile bootstrap estimates, not simultaneous guarantees. The queue-responsive rule is also reported; it is not a full network max-pressure implementation.</p></section>
<section id="method"><div class="section-line"><h2>Open the signal box.</h2><span>REPRODUCIBLE BY DESIGN</span></div><div class="method-grid"><article><span>01 / MODEL THE CONSTRAINTS</span><h3>A switch takes time.</h3><p>At least 5 green ticks before switching, 2 all-red clearance ticks, and a forced switch at 20 green ticks. All controllers use the same interlock.</p></article><article><span>02 / COUNT WHAT MATTERS</span><h3>No disappearing cars.</h3><p>Arrived = served + overflow + still waiting. A queue is capped at 50 per direction; overflow remains counted and receives a training penalty.</p></article><article><span>03 / SEPARATE THE EVIDENCE</span><h3>Train here. Test there.</h3><p>450 training episodes use separate arrival seeds from evaluation. The learned table is frozen; this website runs inference, not online training.</p></article></div><details><summary>What exactly did the agent learn?</summary><p>Tabular Q-learning chooses hold or request-switch from queue bins, phase, green age and clearance state. Reward is negative queue length, minus 30 per overflow vehicle and 2 per switch. The simulator can override an early or overdue request. There is no language model, DQN or multi-agent system here.</p></details><details><summary>Why can traffic build up even with a good controller?</summary><p>Only one direction discharges at a time, at most three vehicles per tick, with lost service during clearance. The overload scenario averages five arrivals per tick, beyond this capacity. Its queues cannot be stabilized by signal timing alone. Queues and overflow expose the unmet demand.</p></details><details><summary>Can these results be used on real roads?</summary><p>No. This is a synthetic two-road experiment without turning movements, pedestrians, downstream spillback, network coordination or calibration to road data. The simulator interlock is a modeled constraint, not a certified safety system. Real deployment would need a different engineering and validation process.</p></details><details><summary>What runs on my device?</summary><p>The small frozen policy, simulator and results are public static files. Your selected seed and scenario run inside a browser worker. No account, analytics, upload, paid model call or server-side simulation is used. Pause stops replay; cancel terminates an in-progress worker. Exported files contain only synthetic experiment data.</p></details><details><summary>What changed from the original notebooks?</summary><p>The two repositories had their implementation files swapped. Their text is preserved with provenance. The rebuilt traffic project removes notebook shell commands, model downloads, automatic public tunnels and import-time training. It adds explicit overflow, matched arrival tapes, constrained switching, stronger baselines and executable cross-language trace checks.</p></details></section><footer><a class="brand" href="#">phase.</a><p>Built by Dilip Nallamasa · Synthetic traffic policy research<br>Paired experiments. Visible failures. No universal improvement claim.</p><a href="https://github.com/dilipna/rl-traffic-signal-control/tree/improve/reproducible-traffic-lab" target="_blank" rel="noopener noreferrer">Reproduce the experiment ↗</a></footer></main>`;
let policy,
  report,
  policyHash,
  results = null,
  active = null,
  worker = null,
  workerTimer,
  runVersion = 0,
  playTimer = null,
  index = 0;
const help = {
  balanced:
    "Equal demand in both directions. A useful check against a simple timer.",
  "north-rush":
    "More traffic north–south, less east–west. Can the controller adapt?",
  tidal: "The busy direction reverses halfway through the run.",
  saturated: "Arrivals exceed total discharge capacity. Watch the overflow.",
  incident: "Service drops from 3 to 1 in the middle third of the run.",
};
const num = (n, d = 1) => (n === null ? "—" : Number(n).toFixed(d));
function status(text) {
  $("status").textContent = text;
}
function create(tag, text) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  return e;
}
async function hash(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
function stop() {
  clearInterval(playTimer);
  playTimer = null;
  $("play").textContent = "Play replay";
}
function draw() {
  if (!results) return;
  const frame = results[$("focus").value].frames[index];
  $("tick-count").textContent = `${index} / 239`;
  $("tick").value = index;
  $("phase-label").textContent = frame.allRed
    ? "ALL RED / CLEARANCE"
    : frame.phase === 0
      ? "N/S GREEN"
      : "E/W GREEN";
  $("center-label").textContent = frame.allRed
    ? "CLEARANCE"
    : frame.phase === 0
      ? "N/S OPEN"
      : "E/W OPEN";
  $("ns-count").textContent = frame.queues[0];
  $("ew-count").textContent = frame.queues[1];
  $("map-desc").textContent =
    `${names[$("focus").value]}, tick ${index}: north-south queue ${frame.queues[0]}, east-west queue ${frame.queues[1]}, ${$("phase-label").textContent}.`;
  for (const [i, id] of [
    [0, "ns-light"],
    [1, "ew-light"],
  ])
    $(id).setAttribute(
      "fill",
      !frame.allRed && frame.phase === i ? "#a6d6b0" : "#d17c76",
    );
  const reasons = {
    hold: "Controller holds the phase.",
    clearance: "Both signals remain red during clearance.",
    "minimum-green":
      "Switch request blocked until the minimum green is reached.",
    "maximum-green": "Simulator forces a switch at the maximum green.",
    "controller-request":
      "Controller switch request accepted; clearance begins.",
  };
  $("decision").textContent =
    `${names[$("focus").value]} requested ${frame.requestedAction ? "switch" : "hold"}. ${reasons[frame.decisionReason]} State before action: ${frame.stateBefore}. This is an execution trace, not a reasoning transcript.`;
  const cars = $("cars");
  cars.replaceChildren();
  for (let direction = 0; direction < 2; direction++)
    for (let i = 0; i < Math.min(16, frame.queues[direction]); i++) {
      const car = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      const col = i % 2,
        row = Math.floor(i / 2);
      car.setAttribute(
        "x",
        direction === 0 ? String(330 + col * 23) : String(178 - row * 23),
      );
      car.setAttribute(
        "y",
        direction === 0 ? String(322 + row * 13) : String(248 + col * 20),
      );
      car.setAttribute("width", direction === 0 ? "12" : "18");
      car.setAttribute("height", direction === 0 ? "9" : "12");
      car.setAttribute("rx", "2");
      car.setAttribute("fill", direction === 0 ? "#e5bf71" : "#a5b1ed");
      cars.append(car);
    }
}
function metrics() {
  const body = $("metric-rows");
  body.replaceChildren();
  for (const c of ["q", "fixed", "queue"]) {
    const r = create("tr");
    r.dataset.controller = c;
    const m = results[c].metrics;
    for (const text of [
      names[c],
      num(m.meanQueue),
      m.served,
      m.dropped,
      m.remaining,
      num(m.p95ServedWait, 0),
    ])
      r.append(create("td", text));
    body.append(r);
  }
  $("result-label").textContent =
    `${SCENARIOS[active.scenario].name} · seed ${active.seed} · 240 ticks`;
  const chart = $("chart");
  chart.replaceChildren();
  const max = Math.max(
    1,
    ...Object.values(results).flatMap((r) =>
      r.frames.map((f) => f.queues[0] + f.queues[1]),
    ),
  );
  for (const [c, color] of [
    ["q", "#6255a2"],
    ["fixed", "#b77820"],
    ["queue", "#327d84"],
  ]) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      results[c].frames
        .map(
          (f, i) =>
            `${i ? "L" : "M"}${(i / 239) * 980 + 10},${155 - ((f.queues[0] + f.queues[1]) / max) * 140}`,
        )
        .join(" "),
    );
    path.setAttribute("stroke", color);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "2");
    chart.append(path);
  }
  chart.setAttribute(
    "aria-label",
    `Total queues over 240 ticks, scale 0 to ${max} vehicles. Exact aggregate values appear in the comparison table and receipt.`,
  );
}
function cancel() {
  runVersion++;
  if (worker) worker.terminate();
  worker = null;
  clearTimeout(workerTimer);
  $("run").disabled = false;
  $("cancel").hidden = true;
  status(
    "Run cancelled. Previous completed results remain labeled with their original scenario.",
  );
}
function run() {
  if (!policy) {
    status("The frozen policy is not ready. Reload to retry.");
    return;
  }
  const scenario = $("scenario").value,
    seed = Number($("seed").value);
  if (
    !Object.hasOwn(SCENARIOS, scenario) ||
    !/^\d+$/.test($("seed").value) ||
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 4294967295
  ) {
    status("Enter a whole-number seed from 0 to 4294967295.");
    return;
  }
  if (worker) worker.terminate();
  clearTimeout(workerTimer);
  stop();
  const version = ++runVersion;
  $("run").disabled = true;
  $("cancel").hidden = false;
  status("Comparing three controllers on one arrival tape…");
  worker = new Worker(new URL("./worker.js", import.meta.url), {
    type: "module",
  });
  workerTimer = setTimeout(() => {
    if (version === runVersion) {
      cancel();
      status("Run exceeded 8 seconds. Retry or use another seed.");
    }
  }, 8000);
  worker.onerror = () => {
    if (version === runVersion) {
      cancel();
      status(
        "Simulation worker failed. Your previous completed result was preserved.",
      );
    }
  };
  worker.onmessage = async ({ data }) => {
    if (version !== runVersion) return;
    clearTimeout(workerTimer);
    worker.terminate();
    worker = null;
    $("run").disabled = false;
    $("cancel").hidden = true;
    if (data.error) {
      status(data.error);
      return;
    }
    const tapeHash = await hash(
      new TextEncoder().encode(JSON.stringify(data.tape)),
    );
    if (version !== runVersion) return;
    results = data.results;
    active = { scenario, seed, tapeHash, policyHash };
    index = 0;
    $("results").hidden = false;
    $("play").disabled = false;
    $("tick").disabled = false;
    $("active-run").textContent = `${SCENARIOS[scenario].name} / seed ${seed}`;
    metrics();
    draw();
    history.replaceState(
      null,
      "",
      `?scenario=${scenario}&seed=${seed}&controller=${$("focus").value}`,
    );
    status(
      "Comparison ready. All controllers received identical arrivals. Press Play to replay.",
    );
  };
  worker.postMessage({ scenario, seed, policy });
}
function evidence() {
  const table = create("table"),
    head = create("thead"),
    hr = create("tr");
  for (const text of [
    "Scenario",
    "Fixed queue",
    "Rule queue",
    "Learned queue",
    "Q − fixed / 95% interval",
    "Overflow: Q / fixed",
    "Served: Q / fixed",
  ])
    hr.append(create("th", text));
  head.append(hr);
  table.append(head);
  const body = create("tbody");
  for (const r of report.summary) {
    const tr = create("tr");
    const first = create("td");
    const button = create("button", r.name);
    button.className = "text-button";
    button.addEventListener("click", () => {
      $("scenario").value = r.scenario;
      $("scenario-help").textContent = help[r.scenario];
      run();
      $("lab").scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
    first.append(button);
    tr.append(first);
    for (const c of ["fixed", "queue", "q"])
      tr.append(create("td", num(r.controllers[c].meanQueue)));
    tr.append(
      create(
        "td",
        `${num(r.qMinusFixedMeanQueue)} [${r.paired95Interval.map((n) => num(n)).join(", ")}]`,
      ),
    );
    tr.append(
      create(
        "td",
        `${num(r.controllers.q.dropped)} / ${num(r.controllers.fixed.dropped)}`,
      ),
    );
    tr.append(
      create(
        "td",
        `${num(r.controllers.q.served)} / ${num(r.controllers.fixed.served)}`,
      ),
    );
    body.append(tr);
  }
  table.append(body);
  $("evidence-table").replaceChildren(table);
}
function download(value, type, extension) {
  if (!active || !results) return;
  const blob = new Blob([value], { type }),
    url = URL.createObjectURL(blob),
    a = create("a");
  a.href = url;
  a.download = `phase-${active.scenario}-${active.seed}.${extension}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status("Downloaded synthetic experiment data for the completed run.");
}
$("run").addEventListener("click", run);
$("cancel").addEventListener("click", cancel);
$("scenario").addEventListener("change", () => {
  $("scenario-help").textContent = help[$("scenario").value];
  if (results)
    status(
      "Conditions changed. Press Run comparison to replace the completed results.",
    );
});
$("focus").addEventListener("change", draw);
$("tick").addEventListener("input", () => {
  stop();
  index = Number($("tick").value);
  draw();
});
$("reset").addEventListener("click", () => {
  stop();
  index = 0;
  draw();
});
$("play").addEventListener("click", () => {
  if (playTimer) {
    stop();
    return;
  }
  if (!results) return;
  if (index === 239) index = 0;
  $("play").textContent = "Pause replay";
  playTimer = setInterval(() => {
    if (index >= 239) {
      stop();
      return;
    }
    index++;
    draw();
  }, 300);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
$("receipt").addEventListener("click", () => {
  if (!active) return;
  download(
    JSON.stringify(
      {
        schema: 1,
        tool: "Phase",
        experiment: active,
        metrics: Object.fromEntries(
          Object.entries(results).map(([c, r]) => [c, r.metrics]),
        ),
        traces: results,
        limits: report.limits,
        units: report.units,
      },
      null,
      2,
    ),
    "application/json",
    "json",
  );
});
$("notes").addEventListener("click", () => {
  if (!active) return;
  download(
    [
      "# Phase comparison",
      `Scenario: ${SCENARIOS[active.scenario].name}`,
      `Seed: ${active.seed}`,
      `Arrival tape SHA-256: ${active.tapeHash}`,
      `Policy file SHA-256: ${active.policyHash}`,
      "",
      "Controller | Mean queue | Served | Overflow | Remaining",
      "--- | ---: | ---: | ---: | ---:",
      ...Object.entries(results).map(
        ([c, r]) =>
          `${names[c]} | ${num(r.metrics.meanQueue)} | ${r.metrics.served} | ${r.metrics.dropped} | ${r.metrics.remaining}`,
      ),
      "",
      ...report.limits.map((x) => "- " + x),
      "Synthetic ticks, not seconds. Browser runs are explorations, not a replacement of the frozen evaluation.",
    ].join("\n"),
    "text/markdown",
    "md",
  );
});
$("share").addEventListener("click", async () => {
  if (!active) return;
  const url = new URL(location.origin + location.pathname);
  url.searchParams.set("scenario", active.scenario);
  url.searchParams.set("seed", active.seed);
  url.searchParams.set("controller", $("focus").value);
  try {
    await navigator.clipboard.writeText(url.href);
    status("Experiment link copied.");
  } catch {
    $("share-fallback").textContent = url.href;
    $("share-fallback").hidden = false;
    status("Copy the experiment link displayed below the buttons.");
  }
});
async function initialize() {
  try {
    const [policyResponse, reportResponse, manifestResponse] =
      await Promise.all([
        fetch("/evidence/policy.json"),
        fetch("/evidence/evaluation.json"),
        fetch("/evidence/artifacts.json"),
      ]);
    if (!policyResponse.ok || !reportResponse.ok || !manifestResponse.ok)
      throw Error("Evidence unavailable");
    const bytes = await policyResponse.arrayBuffer();
    const manifest = await manifestResponse.json();
    policyHash = await hash(bytes);
    if (policyHash !== manifest.policyFileSha256)
      throw Error("Policy checksum mismatch");
    policy = JSON.parse(new TextDecoder().decode(bytes));
    report = await reportResponse.json();
    evidence();
    const params = new URLSearchParams(location.search),
      scenario = params.get("scenario"),
      seed = params.get("seed"),
      controller = params.get("controller");
    if (scenario && Object.hasOwn(SCENARIOS, scenario))
      $("scenario").value = scenario;
    if (seed && /^\d+$/.test(seed) && Number(seed) <= 4294967295)
      $("seed").value = seed;
    if (controller && Object.hasOwn(names, controller))
      $("focus").value = controller;
    $("scenario-help").textContent = help[$("scenario").value];
    run();
  } catch (error) {
    status(
      "The frozen evidence could not be loaded. Reload to retry. No results are invented.",
    );
    $("run").disabled = true;
    $("evidence-table").textContent =
      "Evaluation unavailable. Reload to retry.";
  }
}
void initialize();
