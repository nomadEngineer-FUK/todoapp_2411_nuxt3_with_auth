import type { User } from "@supabase/supabase-js";
// ExtendedUser型を定義
export interface ExtendedUser extends Omit<User, 'aud' | 'role'>  {
  username?: string | null;
  account_status?: string | null;
  role?: string | null;
}

/**
 * Todoの型
 * @typedef {Object} Todo
 * @property {string} title     Todoのタイトル
 * @property {string | null} detail   Todoの詳細
 * @property {string | null} deadline Todoの期日
 * @property {boolean} status   Todoの完了/未完了
 * @property {number} id        TodoのユニークID
 * @property {string} user_id   Todoの作成者のID
 * @property {string} [role]    作成者の役割（オプション）
 */
export type Todo = {
    title: string;
    detail: string | null;
    deadline: string | null;
    status: boolean;
    id: number;
    user_id: string;
    role?: string;
};

export type UserProfile = {
    username: string;
    email: string;
    role: string;
    account_status: string;
}

// ====================
//   ソート型定義
// ====================

/**
 * ソート可能な項目（todos）
 * @typedef {'id' | 'title' | 'deadline'} SortType
 */
export type SortType = 'id' | 'title' | 'deadline';

/**
 * ソート可能な項目（users）
 * @typedef {'email' | 'username' | 'account_status'} SortType
 */
export type UserSortType = 'email' | 'username' | 'role' |  'account_status';
