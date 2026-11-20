import { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { BlockItem, ScreenBlock } from "../lib/product";
import { Badge as KeyBadge } from "@/components/ui/badge";

// Экран первой версии продукта. Гермес при выборе стартапа описывает каждый
// экран блоками с демо-данными по теме идеи, а сайт рисует из них простой
// работающий прототип: кнопки нажимаются, формы «отправляются» понарошку.
// Кода от агента здесь нет, поэтому первая версия выходит быстро и не ломается.

function Caps({ children }: { children: string }) {
  return <p className="label-caps text-xs text-muted-foreground">{children}</p>;
}

/** Кнопка, которая после нажатия показывает, что действие выполнено. */
function PressButton({
  label,
  size = "default",
  variant = "default",
}: {
  label: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline";
}) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size={size}
      variant={done ? "secondary" : variant}
      onClick={() => setDone((d) => !d)}
      aria-pressed={done}
    >
      {done && <CheckIcon data-icon="inline-start" />}
      {label}
    </Button>
  );
}

function Intro({ block }: { block: ScreenBlock }) {
  return (
    <section className="flex flex-col gap-3">
      {block.title && (
        <h2 className="text-2xl leading-tight lg:text-3xl">{block.title}</h2>
      )}
      {block.text && (
        <p className="text-base leading-relaxed text-muted-foreground">
          {block.text}
        </p>
      )}
      {block.button && (
        <div>
          <PressButton label={block.button} size="lg" />
        </div>
      )}
    </section>
  );
}

function ItemCard({ item }: { item: BlockItem }) {
  return (
    <Card size="sm">
      <CardHeader>
        {item.meta && <Caps>{item.meta}</Caps>}
        <CardTitle className="text-base">{item.title}</CardTitle>
        {item.text && <CardDescription>{item.text}</CardDescription>}
        {item.button && (
          <CardAction>
            <PressButton label={item.button} size="sm" variant="outline" />
          </CardAction>
        )}
      </CardHeader>
      {item.badge && (
        <CardContent>
          <Badge variant="secondary">{item.badge}</Badge>
        </CardContent>
      )}
    </Card>
  );
}

function Cards({ block }: { block: ScreenBlock }) {
  return (
    <section className="flex flex-col gap-3">
      {block.title && <h3 className="text-lg leading-snug">{block.title}</h3>}
      {block.text && (
        <p className="text-sm text-muted-foreground">{block.text}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {block.items.map((item, i) => (
          <ItemCard key={`${item.title}-${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function List({ block }: { block: ScreenBlock }) {
  return (
    <section className="flex flex-col gap-3">
      {block.title && <h3 className="text-lg leading-snug">{block.title}</h3>}
      <Card size="sm" className="gap-0 py-0">
        {block.items.map((item, i) => {
          // a short mark (a time like 12:30) sits in its own column, a long one above the title
          const side = item.meta !== "" && item.meta.length <= 6;
          return (
            <div
              key={`${item.title}-${i}`}
              className={cn(
                "flex items-start gap-4 px-4 py-3",
                i > 0 && "border-t border-border",
              )}
            >
              {side && (
                <span className="w-14 shrink-0 pt-0.5 text-sm font-semibold text-primary">
                  {item.meta}
                </span>
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                {item.meta && !side && (
                  <span className="text-sm font-semibold text-primary">
                    {item.meta}
                  </span>
                )}
                <span className="text-[15px] font-semibold text-foreground">
                  {item.title}
                </span>
                {item.text && (
                  <span className="text-sm text-muted-foreground">
                    {item.text}
                  </span>
                )}
              </span>
              {item.badge && <Badge variant="outline">{item.badge}</Badge>}
            </div>
          );
        })}
      </Card>
    </section>
  );
}

function Form({ block, formId }: { block: ScreenBlock; formId: string }) {
  const [sent, setSent] = useState(false);
  return (
    <Card>
      <CardHeader>
        {block.title && (
          <CardTitle className="text-lg">{block.title}</CardTitle>
        )}
        {block.text && <CardDescription>{block.text}</CardDescription>}
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-base text-foreground">
            {block.done ||
              "Готово! Это демо, на самом деле ничего не отправилось."}
          </p>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {block.fields.map((field, i) => {
              const id = `${formId}-${i}`;
              return (
                <div key={id} className="flex flex-col gap-2">
                  <Label htmlFor={id}>{field}</Label>
                  <Input id={id} placeholder={field} />
                </div>
              );
            })}
            <Button type="submit" size="lg" className="self-start">
              {block.button || "Отправить"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Stats({ block }: { block: ScreenBlock }) {
  return (
    <section className="flex flex-col gap-3">
      {block.title && <h3 className="text-lg leading-snug">{block.title}</h3>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {block.items.map((item, i) => (
          <Card key={`${item.title}-${i}`} size="sm">
            <CardContent className="flex flex-col gap-1">
              <span className="text-3xl leading-none font-semibold text-primary">
                {item.meta || item.text || "—"}
              </span>
              <span className="text-sm text-muted-foreground">
                {item.title}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Chips({ block }: { block: ScreenBlock }) {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (t: string) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  return (
    <section className="flex flex-col gap-3">
      {block.title && <h3 className="text-lg leading-snug">{block.title}</h3>}
      <div className="flex flex-wrap gap-2">
        {block.items.map((item, i) => {
          const on = picked.includes(item.title);
          return (
            <Button
              key={`${item.title}-${i}`}
              size="sm"
              variant={on ? "default" : "outline"}
              onClick={() => toggle(item.title)}
              aria-pressed={on}
            >
              {item.title}
            </Button>
          );
        })}
      </div>
      {block.text && (
        <p className="text-sm text-muted-foreground">{block.text}</p>
      )}
    </section>
  );
}

/** Фото с разбором понарошку: фото остаётся в телефоне, разбор из заготовок. */
function Upload({ block, inputId }: { block: ScreenBlock; inputId: string }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "busy" | "done">("idle");
  const [pick, setPick] = useState(0);
  useEffect(() => {
    if (stage !== "busy") return;
    const timer = window.setTimeout(() => setStage("done"), 1600);
    return () => window.clearTimeout(timer);
  }, [stage]);
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo);
    },
    [photo],
  );
  const onFile = (file: File | undefined) => {
    if (!file) return;
    try {
      setPhoto(URL.createObjectURL(file));
    } catch {
      setPhoto(null);
    }
    setPick((file.size + file.name.length) % Math.max(1, block.items.length));
    setStage("busy");
  };
  const result = block.items[pick];
  return (
    <Card>
      <CardHeader>
        {block.title && <CardTitle className="text-lg">{block.title}</CardTitle>}
        {block.text && <CardDescription>{block.text}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {photo && (
          <img src={photo} alt="" className="max-h-72 w-full rounded-xl object-cover" />
        )}
        {stage === "busy" && (
          <p className="text-base text-muted-foreground">Анализируем фото…</p>
        )}
        {stage === "done" && result && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-secondary p-4">
            {result.badge && (
              <span>
                <Badge variant="secondary">{result.badge}</Badge>
              </span>
            )}
            <p className="text-base font-semibold text-foreground">{result.title}</p>
            {result.text && (
              <p className="text-sm text-muted-foreground">{result.text}</p>
            )}
          </div>
        )}
        {stage === "done" && block.done && (
          <p className="text-sm text-muted-foreground">{block.done}</p>
        )}
        <Button asChild size="lg" className="self-start">
          <label htmlFor={inputId}>
            {stage === "done" ? "Загрузить другое фото" : block.button || "Загрузить фото"}
          </label>
        </Button>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}

/** Результат с наибольшим числом совпадений ключей ответов; при равенстве первый. */
function pickResult(results: BlockItem[], keys: string[]): BlockItem | undefined {
  let best: BlockItem | undefined;
  let bestScore = -1;
  for (const r of results) {
    const meta = r.meta.toUpperCase();
    const score = keys.filter((k) => k && meta.includes(k.toUpperCase())).length;
    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best;
}

/** Тест: ответы на вопросы, потом результат по ключам ответов. */
function Quiz({ block }: { block: ScreenBlock }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    block.items.map(() => null),
  );
  const [shown, setShown] = useState(false);
  const all = answers.every((a) => a !== null);
  const keys = block.items.map((q, i) => {
    const a = answers[i];
    return a === null || a === undefined ? "" : (q.options[a]?.key ?? "");
  });
  // буквы шкал складываются в тип, например ENTJ; длинные ключи не показываем
  const code = keys.every((k) => k.length > 0 && k.length <= 2) ? keys.join("") : "";
  const result = pickResult(block.results, keys);
  return (
    <Card>
      <CardHeader>
        {block.title && <CardTitle className="text-lg">{block.title}</CardTitle>}
        {block.text && <CardDescription>{block.text}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {block.items.map((q, i) => (
          <div key={`${q.title}-${i}`} className="flex flex-col gap-2">
            <p className="text-[15px] font-semibold text-foreground">
              {i + 1}. {q.title}
            </p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((o, j) => (
                <Button
                  key={`${o.text}-${j}`}
                  size="sm"
                  variant={answers[i] === j ? "default" : "outline"}
                  aria-pressed={answers[i] === j}
                  onClick={() => {
                    setAnswers((prev) => prev.map((a, k) => (k === i ? j : a)));
                    setShown(false);
                  }}
                >
                  {o.text}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {shown && result ? (
          <div className="flex flex-col gap-1.5 rounded-xl bg-secondary p-4">
            {code && (
              <span>
                <KeyBadge>{code}</KeyBadge>
              </span>
            )}
            <p className="text-base font-semibold text-foreground">{result.title}</p>
            {result.text && (
              <p className="text-sm text-muted-foreground">{result.text}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="self-start"
              disabled={!all}
              onClick={() => setShown(true)}
            >
              {block.button || "Узнать результат"}
            </Button>
            {!all && (
              <p className="text-sm text-muted-foreground">
                Ответьте на все вопросы, чтобы увидеть результат.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** График на условных данных: горизонтальные столбцы, число берётся из meta. */
function Chart({ block }: { block: ScreenBlock }) {
  const rows = block.items.map((item) => {
    const v = Number.parseFloat(item.meta.replace(",", ".").replace(/[^0-9.-]/g, ""));
    return { item, v: Number.isFinite(v) && v > 0 ? v : 0 };
  });
  const max = Math.max(1, ...rows.map((r) => r.v));
  return (
    <section className="flex flex-col gap-3">
      {block.title && <h3 className="text-lg leading-snug">{block.title}</h3>}
      <Card size="sm">
        <CardContent className="flex flex-col gap-3">
          {rows.map(({ item, v }, i) => (
            <div key={`${item.title}-${i}`} className="flex flex-col gap-1">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-foreground">{item.title}</span>
                <span className="shrink-0 font-semibold text-primary">{item.meta}</span>
              </div>
              <div className="h-2.5 rounded-full bg-secondary">
                <div
                  className="h-2.5 rounded-full bg-primary"
                  style={{ width: `${v > 0 ? Math.max(4, (v / max) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {block.text && <p className="text-sm text-muted-foreground">{block.text}</p>}
    </section>
  );
}

/** Экран из блоков. */
export function ScreenBlocks({
  blocks,
  screenId,
}: {
  blocks: ScreenBlock[];
  screenId: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block, i) => {
        const key = `${block.kind}-${i}`;
        switch (block.kind) {
          case "intro":
            return <Intro key={key} block={block} />;
          case "cards":
            return <Cards key={key} block={block} />;
          case "list":
            return <List key={key} block={block} />;
          case "form":
            return (
              <Form key={key} block={block} formId={`${screenId}-form-${i}`} />
            );
          case "stats":
            return <Stats key={key} block={block} />;
          case "chips":
            return <Chips key={key} block={block} />;
          case "upload":
            return (
              <Upload key={key} block={block} inputId={`${screenId}-upload-${i}`} />
            );
          case "quiz":
            return <Quiz key={key} block={block} />;
          case "chart":
            return <Chart key={key} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
