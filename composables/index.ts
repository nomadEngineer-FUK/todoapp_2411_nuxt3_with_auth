import type { Todo, SortType, ExtendedUser, UserSortType } from '../types/type';

import type { User } from '@supabase/supabase-js'; // user情報

// ======= todo関連の状態管理 =======

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


// ======= ソート関連の状態管理 =======

  // ソート順序
  export const useSortOrder = () => useState<'asc' | 'desc'>('sortOrder', () => 'asc');

  // ソート項目（todoのテーブル）
  export const useSelectedSort = () => useState<SortType>('selectedSort', () => 'id');

  // Search時の値（idとdeadline、statusは検索対象外）
  export const useSearchText = () => useState<string | null>('searchText', () => null);

  // 検索対象のtodosが空欄か否かのフラグ
export const useIsEmptyAfterSearch = () => useState<boolean>('isEmptyAfterSearch', () => false);



// ======= 認証関連の状態管理 =======

  // 現在のユーザー情報
  export const useAuthUser = () => useState<ExtendedUser | null>('authUser', () => null);

  // 認証完了のフラグ
  export const useIsAuthenticated = () => useState<boolean>('isAuthenticated', () => false);

// ======= プロフィール関連の状態管理 =======

  // プロフィールを編集用にuser情報を保持
  export const useNewAuthUser = () => useState<Partial<ExtendedUser>>('newAuthUser', () => ({
      id: '',
      username: 'sample',
      email: 'sample@test.com',
      role: 'user',
      account_status: 'active'
  }));


// ======= ユーザー関連の状態管理 =======

// 登録されている全ユーザー
export const useAllUsers = () => useState<Partial<ExtendedUser>[]>('allUsers', () => []);

// ソート順序
export const useSortOrderForUser = () => useState<'asc' | 'desc'>('sortOrderForUser', () => 'asc');

// ソート項目（usersテーブル）
export const useSelectedSortForUser = () => useState<UserSortType>('selectedSortForUser', () => 'username');
