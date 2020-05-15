import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const todoAccess = new TodoAccess()

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({ signatureVersion: 'v4' })

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId)
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

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoItem> {
    return await todoAccess.updateTodo(userId, todoId, updateTodoRequest)
}

export async function deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    return await todoAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(userId: string, todoId: string): Promise<string> {
    await todoAccess.createImage(userId, todoId);
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    })
}
