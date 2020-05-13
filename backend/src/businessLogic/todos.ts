import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
    return todoAccess.getAllTodos()
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {

    const itemId = uuid.v4()

    return await todoAccess.createTodo({
        todoId: itemId,
        userId,
        name: createTodoRequest.name,
        createdAt: new Date().toISOString(),
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}
