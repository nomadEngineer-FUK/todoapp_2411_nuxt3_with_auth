// ====================
//      Todo型定義
// ====================

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


// ====================
//   ソート型定義
// ====================

/**
 * ソート可能な項目
 * @typedef {'id' | 'title' | 'deadline'} SortType
 */
export type SortType = 'id' | 'title' | 'deadline';
