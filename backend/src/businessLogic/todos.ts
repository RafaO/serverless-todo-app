import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

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

export async function updateTodo(todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoItem> {
    return await todoAccess.updateTodo(todoId, updateTodoRequest)
}

export async function deleteTodo(todoId: string): Promise<TodoItem> {
    return await todoAccess.deleteTodo(todoId)
}
