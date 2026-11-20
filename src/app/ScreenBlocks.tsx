import { useState } from "react";
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
          default:
            return null;
        }
      })}
    </div>
  );
}
