import { describe, expect, it } from 'vitest'
import type { Note } from '~/types/note'
import { applyCommand, createHistory } from '~/utils/history'

function makeNote(): Note {
  return {
    id: 'n1',
    title: 'Покупки',
    todos: [
      { id: 't1', text: 'Молоко', done: false },
      { id: 't2', text: 'Хлеб', done: true },
    ],
    createdAt: 0,
    updatedAt: 0,
  }
}

describe('createHistory', () => {
  it('отменяет и повторяет команды в правильном порядке', () => {
    const history = createHistory<string>()
    history.push('a')
    history.push('b')

    expect(history.undo()).toBe('b')
    expect(history.undo()).toBe('a')
    expect(history.undo()).toBeUndefined()

    expect(history.redo()).toBe('a')
    expect(history.redo()).toBe('b')
    expect(history.redo()).toBeUndefined()
  })

  it('новое изменение после undo очищает redo-ветку', () => {
    const history = createHistory<string>()
    history.push('a')
    history.push('b')
    history.undo()

    history.push('c')

    expect(history.canRedo.value).toBe(false)
    expect(history.redo()).toBeUndefined()
    expect(history.undo()).toBe('c')
    expect(history.undo()).toBe('a')
  })

  it('хранит не больше 50 шагов, выбрасывая самые старые', () => {
    const history = createHistory<number>()
    for (let i = 1; i <= 60; i++) history.push(i)

    const undone: number[] = []
    let command = history.undo()
    while (command !== undefined) {
      undone.push(command)
      command = history.undo()
    }

    expect(undone).toHaveLength(50)
    expect(undone[0]).toBe(60)
    expect(undone.at(-1)).toBe(11)
  })

  it('canUndo / canRedo отражают состояние стеков', () => {
    const history = createHistory<string>()
    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(false)

    history.push('a')
    expect(history.canUndo.value).toBe(true)

    history.undo()
    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(true)
  })

  it('clear сбрасывает обе ветки', () => {
    const history = createHistory<string>()
    history.push('a')
    history.push('b')
    history.undo()

    history.clear()

    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(false)
  })
})

describe('applyCommand', () => {
  it('title: меняет заголовок вперёд и назад', () => {
    const note = makeNote()
    const command = { type: 'title', from: 'Покупки', to: 'Магазин' } as const

    applyCommand(note, command, 'redo')
    expect(note.title).toBe('Магазин')

    applyCommand(note, command, 'undo')
    expect(note.title).toBe('Покупки')
  })

  it('text: меняет текст нужного пункта', () => {
    const note = makeNote()
    const command = { type: 'text', id: 't2', from: 'Хлеб', to: 'Батон' } as const

    applyCommand(note, command, 'redo')
    expect(note.todos[1]?.text).toBe('Батон')
    expect(note.todos[0]?.text).toBe('Молоко')

    applyCommand(note, command, 'undo')
    expect(note.todos[1]?.text).toBe('Хлеб')
  })

  it('toggle: переключает отметку в обе стороны', () => {
    const note = makeNote()
    const command = { type: 'toggle', id: 't1' } as const

    applyCommand(note, command, 'redo')
    expect(note.todos[0]?.done).toBe(true)

    applyCommand(note, command, 'undo')
    expect(note.todos[0]?.done).toBe(false)
  })

  it('add: вставляет пункт на позицию и убирает его при отмене', () => {
    const note = makeNote()
    const item = { id: 't3', text: 'Сыр', done: false }
    const command = { type: 'add', item, index: 1 } as const

    applyCommand(note, command, 'redo')
    expect(note.todos.map((todo) => todo.id)).toEqual(['t1', 't3', 't2'])

    applyCommand(note, command, 'undo')
    expect(note.todos.map((todo) => todo.id)).toEqual(['t1', 't2'])
  })

  it('remove: удаляет пункт и возвращает его на прежнее место', () => {
    const note = makeNote()
    const command = { type: 'remove', item: { id: 't1', text: 'Молоко', done: false }, index: 0 } as const

    applyCommand(note, command, 'redo')
    expect(note.todos.map((todo) => todo.id)).toEqual(['t2'])

    applyCommand(note, command, 'undo')
    expect(note.todos.map((todo) => todo.id)).toEqual(['t1', 't2'])
    expect(note.todos[0]?.text).toBe('Молоко')
  })

  it('вставляет копию пункта: правки в заметке не портят команду в истории', () => {
    const note = makeNote()
    const item = { id: 't3', text: 'Сыр', done: false }

    applyCommand(note, { type: 'add', item, index: 2 }, 'redo')
    note.todos[2]!.text = 'Изменено'

    expect(item.text).toBe('Сыр')
  })
})
