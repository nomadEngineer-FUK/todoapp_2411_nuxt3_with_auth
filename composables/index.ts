import type { Todo, SortType } from '../types/type';
import type { User } from '@supabase/supabase-js'; // user情報

// ==================
//      状態管理
// ==================

// todo一覧
export const useTodos = () => useState<Todo[]>('todos', () => []);

// 新規登録のTodo
export const useNewTodo = () => useState<Todo>('newTodo', () => ({
  title: '',
  detail: '',
  deadline: '',
  status: false,
  id: 0,
  user_id: ''
}));

// 編集用のTodo
export const useEditedTodo = () => useState<Todo | null>('editedTodo', () => null)
// 編集モードのフラグ
export const useIsEditing = () => useState<boolean>('isEditing', () => false);

// 完了・未完了のフラグ
export const useIsCompletion = () => useState<boolean>('isCompletion', () => false);


// ソート関連の状態管理 ===========

// ソート順序
export const useSortOrder = () => useState<'asc' | 'desc'>('sortOrder', () => 'asc');

// ソート項目
export const useSelectedSort = () => useState<SortType>('selectedSort', () => 'id');


// 認証関連の状態管理 ===========

// 現在のユーザー情報
export const useAuthUser = () => useState<User | null>('authUser', () => null);

// 認証完了のフラグ
export const useIsAuthenticated = () => useState<boolean>('isAuthenticated', () => false);