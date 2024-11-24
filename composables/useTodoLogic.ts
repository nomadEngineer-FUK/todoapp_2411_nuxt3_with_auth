import type { Todo } from "../types/type";
import type { User } from "@supabase/supabase-js";
import { useNuxtApp } from "nuxt/app";
import type { T } from "vitest/dist/chunks/environment.LoooBwUu.js";
import { computed } from "vue";

// cspell:ignore Nuxt
// cspell:ignore Supabase
// cspell:ignore todoapp
// cspell:ignore filterd

/**
 * 新規Todoを追加または編集したTodoを更新する関数
 *
 * [処理の流れ]
 * 1. 編集モードの状態(isEditing)を取得。
 * 2. 編集モードの状態により処理を分岐
 *      *True ：updateTodo を呼び出して既存のTodoを更新。
 *      *False：addTodo を呼び出して新規Todoを作成。
 * 3. 処理終了後、編集モードを解除 (isEditing を false に)。
 *
 * @function saveTodo
 * @returns {void}
 */
export const saveTodo = () => {
    const newTodo = useNewTodo();
    const isEditing = useIsEditing();

    // 編集モード=TRUEの場合は「更新」、FALSEの場合は「新規作成」
    isEditing.value ? updateTodo(newTodo.value) : addTodo();
    toggleEditMode(false); // 編集モードを解除
};

/**
 * 新規TodoをSupabaseデータベース（テーブル：2410_todoapp）に追加する非同期関数
 * 
 * [処理の流れ]
 *  1. 状態管理から newTodo と $supabase クライアントを取得。
 *  2. 入力値のバリデーション
 *    - [Validation 1] Todo Titleが入力されているかを確認。未入力の場合はアラートを表示。
 *    - [Validation 2] Deadlineが有効な日付 (YYYY-MM-DD形式) であるか確認。無効な場合はアラートを表示。
 *          Deadlineが入力されていない場合は null を設定。
 *  3. ユーザーのセッションを確認。ログインしていない場合は処理を中断。
 *  4. newTodoのデータをSupabaseの2410_todoappテーブルに挿入。
 *  5. Todoリストを最新の状態に更新
 * 
 * @async
 * @function addTodo
 * @returns {Promise<void>}
 */
export const addTodo = async () => {
    // 状態管理
    const { $supabase } = useNuxtApp(); // Supabaseのクライアントを取得
    const newTodo = useNewTodo();       // 新規登録用のtodoの初期値を取得

    // [Validation 1] Todo Titleは入力必須
    if (!newTodo.value.title) {
        alert('"Todo Title" is a required field.');
        return;
    }

    // [Validation 2] 空欄 or 有効な日付（YYYY-MM-DD） のみ受け付ける
    if (newTodo.value.deadline && !isValidDate(newTodo.value.deadline)) {

        alert('Please enter a valid date (in the format “YYYY-MM-DD”) in the Deadline field.');
        return;

    // 入力が無い場合はnullを代入
    } else if (!newTodo.value.deadline) {
        newTodo.value.deadline = null;
    }

    const user = await checkUserSession(); // セッションを確認してユーザーを取得
    if (!user) {
        console.error('User is not logged in.');
        return;
    }

    // DBに入力値を挿入
    const { data, error } = await $supabase
        .from('2411_todoapp')
        .insert([{
            title: newTodo.value.title,
            detail: newTodo.value.detail,
            deadline: newTodo.value.deadline,
            status: false,
            user_id: user.id
        }])
        .select('*'); // 挿入後のデータを返す;

    // DBへの挿入でエラーが発生した場合
    if (error) {
        console.error("Error inserting todo:", error.message);
        alert("Failed to add the task. Please try again.");
        return;
    }

    // DBへ正常に挿入できた場合
    if (data) {
        await fetchTodos(); // todosの値をデータベースの値と同期
        resetNewTodo();     // newTodoの値をリセット
    };
};

/**
 * Todoの状態を初期化する関数
 *
 * [処理の流れ]
 * 1. 現在のnewTodoの状態を取得。
 * 2. Object.assignを使用してnewTodoの各プロパティを初期値にリセット。
 *    - title: 空文字
 *    - detail: 空文字
 *    - deadline: 空文字
 *    - status: 未完了 (false)
 *    - id: 0
 *
 * @function resetNewTodo
 * @returns {void}
 */
export const resetNewTodo = () => {
    const newTodo = useNewTodo(); // todoの現在値を取得
    Object.assign(newTodo.value, {
        title: '',
        detail: '',
        deadline: '',
        status: false,
        id: 0
    });
};

/**
 * SupabaseからTodoリストのデータを取得し、`todos`の状態を更新する関数
 * 
 * [処理の流れ]
 *  1. 状態を取得
 *      *supabase {User}   Supabaseのテーブル：2410_todoapp の全データ
 *      *todos    {Todo[]} todo一覧
 *  2. エラーが発生した場合、エラーメッセージをコンソールに表示して処理を終了
 *  3. 正常にデータを取得した場合、`todos` の値を更新して同期する
 * 
 * @async
 * @returns {Promise<void>}
 */
export const fetchTodos = async () => {
    // 状態管理
    const { $supabase } = useNuxtApp(); // Supabaseのクライアントを取得
    const todos = useTodos();           // Todoリストの状態を取得

    // DBから全データを取得
    try {
        const { data, error } = await $supabase
            .from('2411_todoapp')
            .select('*');
    
        if (error) {
            console.error('Error fetching todos:', error.message);
            todos.value = []; // エラー時は状態を空にリセット
            return;
        }
        // console.log('Fetched todos:', data);

        // 同期 - 既存のtodosの配列をクリアし、新しいデータで更新
        todos.value.splice(0, todos.value.length, ...data || []);

    } catch (err) {
        console.error('Fetch error:', err);
        todos.value = []; // エラー時は状態を空にリセット
    };
};

/**
 * ユーザーのセッションを確認し、現在のユーザー情報を返す非同期関数
 *
 * [処理の流れ]
 *  1. $supabaseクライアントを使用して現在のセッション情報を取得。
 *  2. セッションが存在しない場合、エラーメッセージをコンソールに出力し、nullを返して処理を中断。
 *  3. セッションが存在する場合は、ユーザー情報 (session.user) を返す。
 *
 * @async
 * @function checkUserSession
 * @returns {Promise<User | null>} ログインしているユーザー情報を返し、セッションがない場合は`null`を返す。
 */
const checkUserSession = async (): Promise<User | null> => {
    const { $supabase } = useNuxtApp();
    const { data: { session } } = await $supabase.auth.getSession();
        
    if (!session) {
        console.error('No active session. User is not logged in.');
        return null;
    };
    
    return session.user;
};


/**
 * フィルタリングおよびソートされたTodoリストを返す計算プロパティ
 * @constant sortedTodosList
 * @returns {Todo[]} フィルタリングおよびソートされたTodoリスト
 */
export const sortedTodosList = computed(() => {
    const todos = useTodos();
    const searchText = useSearchText();
    const isCompletion = useIsCompletion();
    const selectedSort = useSelectedSort();
    const sortOrder = useSortOrder();

    if (!todos.value.length) return [];

    // 1. 検索フィルタリング
    const filteredTodosBySearch = getFilteredDataBySearch(
        todos.value,
        searchText.value,
        ['title', 'detail'] // Todo で検索対象とするキー
    );

    // 2. 完了/未完了フィルタリング
    const filteredTodosByCompletion = getFilteredTodosByCompletion(
        filteredTodosBySearch,
        isCompletion.value
    );

    // 3. ソート処理
    return getSortedData(
        filteredTodosByCompletion,
        selectedSort.value,
        sortOrder.value
    );
});

/**
 * データを検索する汎用関数
 * @template T
 * @param {T[]}           data       - フィルタリング対象のデータ配列
 * @param {string | null} searchText - 検索する文字列（部分一致）
 * @param {(keyof T)[]}   filterKeys - 検索対象とするオブジェクトのキーの配列
 * @returns {T[]} フィルタリングされたデータ配列
 */
export const getFilteredDataBySearch = <T>(
    data: T[],
    searchText: string | null,
    filterKeys: (keyof T)[]
): T[] => {
    if (!searchText) return data;

    // 大文字小文字を区別しない
    const lowerSearchText = searchText.toLowerCase();

    return data.filter((item) =>
        filterKeys.some((key) => {
            const value = item[key];
            if (typeof value === 'string') {
                return value.toLocaleLowerCase().includes(lowerSearchText);
            }
            return false;
        })
    );
};

/**
 * データをソートする汎用関数
 * @template T
 * @param {T[]}            data         - ソート対象のデータ配列
 * @param {keyof T}        selectedSort - ソートの基準となるキー
 * @param {'asc' | 'desc'} sortOrder    - ソート順（昇順または降順）
 * @returns {T[]} ソートされたデータ配列
 */
export const getSortedData = <T>(
    data: T[],
    selectedSort: keyof T,
    sortOrder: 'asc' | 'desc'
): T[] => {
    return [...data].sort((a, b) => {
        const fieldA = a[selectedSort];
        const fieldB = b[selectedSort];

        // ソート対象が `deadline` の場合
        if (selectedSort === 'deadline') {
            const dateA = fieldA ? new Date(fieldA as string).getTime() : Infinity;
            const dateB = fieldB ? new Date(fieldB as string).getTime() : Infinity;

            if (!fieldA) return 1;
            if (!fieldB) return -1;

            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // ソート対象が文字列の場合
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return sortOrder === 'asc'
                ? fieldA.localeCompare(fieldB)
                : fieldB.localeCompare(fieldA);
        }

        // ソート対象が数値の場合
        if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return sortOrder === 'asc'
                ? fieldA - fieldB
                : fieldB - fieldA;
        }

        return 0; // それ以外の型はソートしない
    });
}

/**
 * 完了/未完了でフィルタリングを行う関数
 * @param {Todo[]}  todos        - フィルタリング対象のTodoリスト
 * @param {boolean} isCompletion - 完了タスクを表示するかのフラグ（true: 完了、false: 未完了）
 * @returns {Todo[]} フィルタリングされたTodoリスト
 */
export const getFilteredTodosByCompletion = (todos: Todo[], isCompletion: boolean): Todo[] => {
    return isCompletion
        ? todos.filter(todo => todo.status)   // 完了todo
        : todos.filter(todo => !todo.status); // 未完了todo
};

/**
 * 指定された文字列が有効な日付（YYYY-MM-DD形式）かを判定する関数
 *
 * [処理の流れ]
 *  1. 正規表現で日付文字列が "YYYY-MM-DD" 形式かをチェック。形式が異なる場合は false を返す。
 *  2. new Date() を使用して実際の日付として有効かを確認。無効な日付の場合は false を返す。
 *  3. 年、月、日のそれぞれが指定の範囲内であることを確認し、すべて一致する場合のみ true を返す。
 *
 * @function isValidDate
 * @param {string} dateString - 判定対象の日付文字列
 * @returns {boolean} 有効な日付であれば true、無効な場合は false
 */
export const isValidDate = (dateString: string) => {

    // 日付が "YYYY-MM-DD" 形式かを確認するための正規表現
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(dateString)) return false;

    // 日付が存在するかを確認するために new Date() を使用
    const date = new Date(dateString);

    // 月と日が範囲内かどうかを確認する
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // 月は0から始まるので +1
    const day = date.getUTCDate();

    const [inputYear, inputMonth, inputDay] = dateString.split('-').map(Number);
    
    return year === inputYear && month === inputMonth && day === inputDay;
};

/**
 * 編集するTodoをセットし、編集モードを有効にする関数
 *
 * [処理の流れ]
 * 1. 指定された todo を newTodo の状態としてセット。
 * 2. 編集モードを有効 (isEditing を true) に設定。
 *
 * @function setEditMode
 * @param {Todo} todo - 編集対象のTodoオブジェクト
 * @returns {void}
 */
export const setEditMode = (todo: Todo) => {
    const newTodo = useNewTodo(); // todoの初期値
    newTodo.value = { ...todo };  // 編集対象のTodoをセット
    toggleEditMode(true);         // 編集モード
};

/**
 * 編集モードの状態を切り替える関数
 *
 * [処理の流れ]
 * 1. 現在の編集モードの状態isEditingを取得。
 * 2. 引数`showEdit`の値をisEditingに設定し、編集モードのオンオフを切り替える。
 * 
 * @function toggleEditMode
 * @param {boolean} showEdit - 編集モードをオンにする場合はtrue、オフにする場合はfalseを指定
 * @returns {void}
 */
export const toggleEditMode = (showEdit: boolean) => {
    const isEditing = useIsEditing();
    isEditing.value = showEdit;
};

/**
 * 指定されたTodoをデータベースで更新する非同期関数
 *
 * [処理の流れ]
 * 1. Supabaseクライアントを取得。
 * 2. 指定されたupdatedTodoの情報を基に、データベースの対応するTodoレコードを更新。
 *    - 更新されるフィールド: title, detail, deadline, status
 * 3. 更新処理でエラーが発生した場合はコンソールにエラーメッセージを表示。
 * 4. 更新が完了したら、newTodoの状態をリセットし、最新のTodoリストをデータベースから再取得。
 *
 * @async
 * @function updateTodo
 * @param {Todo} updatedTodo - 更新する内容が含まれたTodoオブジェクト
 * @returns {Promise<void>} 関数は何も返さない
 */
export const updateTodo = async (todo: Todo) => {
    const { $supabase } = useNuxtApp();

    const { error } = await $supabase
        .from('2411_todoapp')
        .update({
            deadline: todo.deadline,
            title: todo.title,
            detail: todo.detail,
            status: todo.status
        })
        .eq('id', todo.id);

    if (error) console.error(error);

    await fetchTodos(); // todosの値をデータベースの値と同期
    resetNewTodo();     // newTodoの値をリセット
};

/**
 * 指定されたIDのTodoをSupabaseデータベースから削除する関数
 * 
 * [処理の流れ]
 *  1. Supabaseクライアントを取得。
 *  2. 削除確認のダイアログを表示し、ユーザーが確認した場合のみ削除処理を続行。
 *  3. データベースの指定されたIDのTodoを削除。
 *  4. 削除が成功した場合、最新のTodoリストを取得して表示を更新。
 * 
 * @async
 * @function deleteTodo
 * @param {Object} todo - 削除対象のTodo
 * @returns {Promise<void>}
 * @throws {Error} Supabaseの操作や非同期処理でエラーが発生した場合、そのエラーをコンソールに表示
 */
export const deleteTodo = async (todo: Todo) => {
    const { $supabase } = useNuxtApp();

    // 実行の確認
    const confirmation = window.confirm('Are you sure you want to DELETE Todo No. ' + todo.id + ' ?');

    if (confirmation) {
        // 引数として受け取ったTodoをデータベースから取得（todo.idがキー）
        const { error } = await $supabase
            .from('2411_todoapp')
            .delete()
            .eq('id', todo.id);

        if (error) {
            console.error('Error deleting todo:', error.message);
            return;
        };

        await fetchTodos(); // Todoリストを再取得（削除後のtodosをブラウザに再表示）
    };
};
