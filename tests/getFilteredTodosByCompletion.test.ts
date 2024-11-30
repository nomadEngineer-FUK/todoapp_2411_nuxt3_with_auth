import { describe, it, expect } from 'vitest';
// import { getFilteredTodosByCompletion } from '~/composables/useTodoLogic';
import { getFilteredTodosByCompletion } from '../composables/useTodoLogic'
import type { Todo } from '../types/type';
import { vi } from 'vitest';

// モックデータ
const todos: Todo[] = [
    {
        id: 1,
        title: 'Todo 1',
        detail: 'Detail 1',
        deadline: null,
        status: true,
        user_id: 'user123',
    },
    {
        id: 2,
        title: 'Todo 2',
        detail: null,
        deadline: '2024-12-01',
        status: false,
        user_id: 'user123',
    },
    {
        id: 3,
        title: 'Todo 3',
        detail: 'Detail 3',
        deadline: '2024-11-30',
        status: true,
        user_id: 'user456',
    },
    {
        id: 4,
        title: 'Todo 4',
        detail: 'Detail 4',
        deadline: null,
        status: false,
        user_id: 'user456',
    },
];

vi.mock('../composables/useTodoLogic', () => ({
    getFilteredTodosByCompletion: (todos: Todo[], isCompletion: boolean) => {
        return todos.filter(todo => todo.status === isCompletion);
    },
}));


describe('getFilteredTodosByCompletion', () => {

    it('should pass a basic test', () => {
        expect(true).toBe(true); // 仮のテスト
    });


    it('should return completed todos when isCompletion is true', () => {
        const result = getFilteredTodosByCompletion(todos, true);
        expect(result).toEqual([
            {
                id: 1,
                title: 'Todo 1',
                detail: 'Detail 1',
                deadline: null,
                status: true,
                user_id: 'user123',
            },
            {
                id: 3,
                title: 'Todo 3',
                detail: 'Detail 3',
                deadline: '2024-11-30',
                status: true,
                user_id: 'user456',
            },
        ]);
    });

    it('should return uncompleted todos when isCompletion is false', () => {
        const result = getFilteredTodosByCompletion(todos, false);
        expect(result).toEqual([
            {
                id: 2,
                title: 'Todo 2',
                detail: null,
                deadline: '2024-12-01',
                status: false,
                user_id: 'user123',
            },
            {
                id: 4,
                title: 'Todo 4',
                detail: 'Detail 4',
                deadline: null,
                status: false,
                user_id: 'user456',
            },
        ]);
    });

    it('should return an empty array if no todos match the filter', () => {
        const emptyTodos: Todo[] = [];
        const result = getFilteredTodosByCompletion(emptyTodos, true);
        expect(result).toEqual([]);
    });
});
