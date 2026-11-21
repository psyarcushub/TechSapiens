import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScreenBlocks } from '../../app/ScreenBlocks'
import type { FeatureManifest } from '../../app/types'
import { product, type ScreenBlock } from '../../lib/product'
import { useLocalState } from '../../lib/store'

export const feature: FeatureManifest = {
  id: 'team-training',
  title: 'Тренировка команды',
  short: 'Тренировка',
  icon: 'calculate',
  kind: 'page',
  order: 100,
  component: TeamTraining,
  authors: ['Ольга Бобрышева'],
}

function TeamTraining() {
  const screen = product.screens.find((s) => s.id === feature.id)
  if (!screen) return null

  return (
    <div className="flex flex-col gap-8">
      {screen.blocks.map((block, index) => {
        const key = `${screen.id}-${index}`
        return block.kind === 'quiz'
          ? <TrainingQuiz key={key} block={block} quizId={key} />
          : <ScreenBlocks key={key} blocks={[block]} screenId={key} />
      })}
    </div>
  )
}

function TrainingQuiz({ block, quizId }: { block: ScreenBlock; quizId: string }) {
  const [answers, setAnswers] = useLocalState<Record<number, number>>(`${feature.id}:${quizId}:answers`, {})
  const [shown, setShown] = useState(false)
  const selected = block.items.map((question, index) => question.options[answers[index]])
  const allAnswered = selected.length > 0 && selected.every(Boolean)
  const correctCount = selected.filter((answer) => answer?.key === 'да').length
  const resultKey = correctCount * 2 >= selected.length ? 'да' : 'нет'
  const result = block.results.find((item) => item.meta === resultKey)

  return (
    <Card>
      <CardHeader>
        {block.title && <CardTitle className="text-lg">{block.title}</CardTitle>}
        {block.text && <CardDescription>{block.text}</CardDescription>}
      </CardHeader>
      <CardContent className="gap-5">
        {block.items.map((question, index) => {
          const questionId = `${quizId}-question-${index}`
          const answer = selected[index]
          return (
            <div key={questionId} role="group" aria-labelledby={questionId} className="flex items-start gap-3">
              <span role="img" aria-label="Котик-талисман" className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-2xl">
                🐱
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p id={questionId} className="text-[15px] font-semibold text-foreground">
                  {index + 1}. {question.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  {question.options.map((option, optionIndex) => (
                    <Button
                      key={optionIndex}
                      type="button"
                      size="sm"
                      className="min-h-11 min-w-11"
                      variant={answers[index] === optionIndex ? 'default' : 'outline'}
                      aria-pressed={answers[index] === optionIndex}
                      onClick={() => {
                        setAnswers((previous) => ({ ...previous, [index]: optionIndex }))
                        setShown(false)
                      }}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
                <p role="status" className={answer ? 'self-start rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground' : 'sr-only'}>
                  {answer && <><span className="sr-only">Котик: </span>{answer.key === 'да' ? 'Мур! Верно!' : 'Попробуй ещё раз, я рядом!'}</>}
                </p>
              </div>
            </div>
          )
        })}
        {shown && allAnswered && result ? (
          <div role="status" className="flex flex-col gap-1.5 rounded-xl bg-secondary p-4">
            <p className="text-base font-semibold text-foreground">{result.title}</p>
            {result.text && <p className="text-sm text-muted-foreground">{result.text}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button type="button" size="lg" className="self-start" disabled={!allAnswered} onClick={() => setShown(true)}>
              {block.button || 'Узнать результат'}
            </Button>
            {!allAnswered && (
              <p className="text-sm text-muted-foreground">Ответьте на все вопросы, чтобы увидеть результат.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
