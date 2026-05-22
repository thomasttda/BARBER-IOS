import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const MODELS_FILE = path.join(ROOT, ".opencode", "fallback-models.json");
const STATE_FILE = path.join(ROOT, ".opencode", "fallback-state.json");
const MIN_COOLDOWN_MS = 15_000;
const REQUIRED_FAILS = 2;

function log(msg: string) {
  console.log(`[fallback] ${msg}`);
}

function loadModels(): string[] {
  try {
    if (!fs.existsSync(MODELS_FILE)) return [];
    const raw = fs.readFileSync(MODELS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed?.models;
    return Array.isArray(list) ? list.filter((m: any) => typeof m === "string" && m.length > 0) : [];
  } catch (e) {
    log(`load error: ${e}`);
    return [];
  }
}

function loadIndex(): number {
  try {
    if (!fs.existsSync(STATE_FILE)) return 0;
    const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    return typeof s.idx === "number" ? s.idx : 0;
  } catch {
    return 0;
  }
}

function saveIndex(idx: number) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify({ idx }, null, 2));
  } catch {}
}

function isQuotaError(data: any): boolean {
  if (!data) return false;
  const msg =
    typeof data === "string"
      ? data
      : data.message ?? data.error ?? data.statusText ?? "";
  return /quota|rate.?limit|4(29|5[23])|too.?many|insufficient_quota|exhausted|limit.?reached|credits?|billing|payment.?required|capacity|over.?limit|throttl|unavailable|service.*unavail/i.test(
    String(msg).toLowerCase()
  );
}

export default async () => {
  const models = loadModels();
  if (models.length === 0) {
    log("No models — create .opencode/fallback-models.json");
    return {};
  }

  let idx = loadIndex();
  if (idx >= models.length) idx = 0;

  let failCount = 0;
  let lastSwitch = Date.now();

  log(`Active: ${models[idx]} (${idx + 1}/${models.length})`);

  function rotate(): boolean {
    const next = (idx + 1) % models.length;
    if (next === 0 && failCount > 0) {
      log("All models exhausted, resetting to first");
      idx = 0;
      failCount = 0;
      lastSwitch = Date.now();
      saveIndex(0);
      return false;
    }
    idx = next;
    failCount = 0;
    lastSwitch = Date.now();
    saveIndex(idx);
    log(`Switched to: ${models[idx]} (${idx + 1}/${models.length})`);
    return true;
  }

  return {
    config: (cfg: any) => {
      if (models[idx]) cfg.model = models[idx];
    },

    "chat.params": (_input: any, output: any) => {
      if (!output || !models[idx]) return;
      output.model = models[idx];
      if (output.args) output.args.model = models[idx];
    },

    event: (evt: any) => {
      if (!evt || typeof evt !== "object") return;

      const type = typeof evt.type === "string" ? evt.type : "";
      const errObj = evt.error ?? evt.payload ?? null;
      if (!errObj && !/error|fail|reject/i.test(type)) return;

      if (errObj && isQuotaError(errObj)) {
        failCount++;
        const elapsed = Date.now() - lastSwitch;
        if (failCount >= REQUIRED_FAILS && elapsed > MIN_COOLDOWN_MS) {
          rotate();
        }
      }
    },
  };
};
